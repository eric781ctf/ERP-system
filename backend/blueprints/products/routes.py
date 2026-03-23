from flask import jsonify, request, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
from extensions import db
from models.product import FabricProduct
from models.product_image import ProductImage
from models.tag import Tag
from schemas.product_schema import (
    CreateProductSchema,
    UpdateProductSchema,
    ProductSummarySchema,
    ProductDetailSchema,
)
from schemas.image_schema import ProductImageSchema
from . import bp

_summary_schema = ProductSummarySchema()
_detail_schema = ProductDetailSchema()
_create_schema = CreateProductSchema()
_update_schema = UpdateProductSchema()


def ok(data=None, message="success", status=200):
    return jsonify({"success": True, "data": data, "message": message}), status


def err(message, status=400):
    return jsonify({"success": False, "data": None, "message": message}), status


def _get_or_404(product_id):
    p = FabricProduct.query.get(product_id)
    if p is None:
        return None
    return p


def _resolve_tags(tag_names):
    """Return Tag objects, creating missing ones (lowercase + strip)."""
    result = []
    for name in tag_names:
        normalized = name.strip().lower()
        if not normalized:
            continue
        tag = Tag.query.filter_by(name=normalized).first()
        if tag is None:
            tag = Tag(name=normalized)
            db.session.add(tag)
        result.append(tag)
    return result


# ── Public endpoints ──────────────────────────────────────────────────────────

@bp.route("", methods=["GET"])
def get_products():
    # Authenticated users (admin) can see all products including drafts
    try:
        verify_jwt_in_request(optional=True)
        is_admin = get_jwt_identity() is not None
    except Exception:
        is_admin = False

    query = FabricProduct.query if is_admin else FabricProduct.query.filter_by(is_published=True)

    tag_param = request.args.get("tags", "")
    if tag_param:
        tag_names = [t.strip().lower() for t in tag_param.split(",") if t.strip()]
        for name in tag_names:
            query = query.filter(FabricProduct.tags.any(Tag.name == name))

    products = query.all()
    return ok(data=_summary_schema.dump(products, many=True))


@bp.route("/<int:product_id>", methods=["GET"])
def get_product(product_id):
    p = _get_or_404(product_id)
    if p is None:
        return err("找不到該產品", 404)
    return ok(data=_detail_schema.dump(p))


# ── Protected endpoints ───────────────────────────────────────────────────────

@bp.route("", methods=["POST"])
@jwt_required()
def create_product():
    from marshmallow import ValidationError
    try:
        data = _create_schema.load(request.get_json(force=True) or {})
    except ValidationError as e:
        return err(str(e.messages), 400)

    if not data.get("composition", "").strip():
        return err("composition 為必填欄位", 400)

    tags = _resolve_tags(data.pop("tags", []))
    p = FabricProduct(**data)
    p.tags = tags
    db.session.add(p)
    db.session.commit()
    return ok(data=_detail_schema.dump(p), message="產品建立成功", status=201)


@bp.route("/<int:product_id>", methods=["PUT"])
@jwt_required()
def update_product(product_id):
    from marshmallow import ValidationError
    p = _get_or_404(product_id)
    if p is None:
        return err("找不到該產品", 404)

    try:
        data = _update_schema.load(request.get_json(force=True) or {})
    except ValidationError as e:
        return err(str(e.messages), 400)

    tags = _resolve_tags(data.pop("tags", []))
    for key, value in data.items():
        if value is not None:
            setattr(p, key, value)
    if tags:
        p.tags = tags

    db.session.commit()
    return ok(data=_detail_schema.dump(p), message="產品更新成功")


@bp.route("/<int:product_id>", methods=["DELETE"])
@jwt_required()
def delete_product(product_id):
    p = _get_or_404(product_id)
    if p is None:
        return err("找不到該產品", 404)

    # Collect S3 URLs before cascade delete
    s3_urls = [img.url for img in p.images]

    db.session.delete(p)
    db.session.commit()

    # Best-effort S3 cleanup (log failures, don't fail the request)
    for url in s3_urls:
        try:
            from services.s3_service import S3UploadService
            S3UploadService().delete_image_by_url(url)
        except Exception as exc:
            current_app.logger.error("S3 delete failed for %s: %s", url, exc)

    return ok(message="產品已刪除")


@bp.route("/<int:product_id>/publish", methods=["PATCH"])
@jwt_required()
def toggle_publish(product_id):
    p = _get_or_404(product_id)
    if p is None:
        return err("找不到該產品", 404)

    body = request.get_json(force=True) or {}
    if "is_published" not in body:
        return err("is_published 為必填", 400)

    p.is_published = bool(body["is_published"])
    db.session.commit()
    return ok(data={"is_published": p.is_published})


_image_schema = ProductImageSchema()


# ── Image management endpoints ────────────────────────────────────────────────

@bp.route("/<int:product_id>/images", methods=["POST"])
@jwt_required()
def upload_image(product_id):
    p = _get_or_404(product_id)
    if p is None:
        return err("找不到該產品", 404)

    if "file" not in request.files:
        return err("請上傳圖片檔案", 400)

    existing_count = ProductImage.query.filter_by(product_id=product_id).count()
    if existing_count >= 6:
        return err("每個產品最多上傳 6 張圖片", 422)

    file = request.files["file"]
    file_bytes = file.read()
    filename = file.filename or "upload.jpg"

    from services.s3_service import S3UploadService, ValidationError as S3Error
    try:
        url = S3UploadService().upload_image(file_bytes, filename, product_id)
    except S3Error as e:
        return err(str(e), 400)
    except Exception as e:
        current_app.logger.error("S3 upload failed: %s", e)
        return err("圖片上傳失敗，請稍後再試", 500)

    img = ProductImage(product_id=product_id, url=url, sort_order=existing_count)
    db.session.add(img)
    try:
        db.session.commit()
    except Exception as e:
        current_app.logger.error("DB write failed after S3 upload, rolling back S3: %s", e)
        S3UploadService().delete_image_by_url(url)
        db.session.rollback()
        return err("圖片上傳失敗，請稍後再試", 500)

    return ok(data=_image_schema.dump(img), message="圖片上傳成功", status=201)


@bp.route("/<int:product_id>/images/<int:image_id>", methods=["DELETE"])
@jwt_required()
def delete_image(product_id, image_id):
    img = ProductImage.query.filter_by(id=image_id, product_id=product_id).first()
    if img is None:
        return err("找不到圖片", 404)

    url = img.url
    db.session.delete(img)
    db.session.flush()

    # Re-sequence sort_order for remaining images
    remaining = (
        ProductImage.query.filter_by(product_id=product_id)
        .order_by(ProductImage.sort_order)
        .all()
    )
    for idx, rem_img in enumerate(remaining):
        rem_img.sort_order = idx

    db.session.commit()

    from services.s3_service import S3UploadService
    S3UploadService().delete_image_by_url(url)

    return ok(message="圖片已刪除")


@bp.route("/<int:product_id>/images/reorder", methods=["PATCH"])
@jwt_required()
def reorder_images(product_id):
    p = _get_or_404(product_id)
    if p is None:
        return err("找不到該產品", 404)

    body = request.get_json(force=True) or {}
    order = body.get("order", [])
    if not order:
        return err("order 為必填", 400)

    # Validate all IDs belong to this product
    images = {img.id: img for img in p.images}
    for img_id in order:
        if img_id not in images:
            return err(f"圖片 {img_id} 不屬於此產品", 400)

    # Two-pass via raw SQL to avoid UNIQUE(product_id, sort_order) conflicts.
    # Pass 1: shift to temporary values ≥ 10 (safely out of the 0-5 range).
    from sqlalchemy import text

    for idx, img_id in enumerate(order):
        db.session.execute(
            text("UPDATE product_images SET sort_order = :s WHERE id = :id"),
            {"s": 10 + idx, "id": img_id},
        )

    # Pass 2: set final 0-based values.
    for new_sort, img_id in enumerate(order):
        db.session.execute(
            text("UPDATE product_images SET sort_order = :s WHERE id = :id"),
            {"s": new_sort, "id": img_id},
        )

    db.session.commit()
    db.session.expire_all()

    updated = (
        ProductImage.query.filter_by(product_id=product_id)
        .order_by(ProductImage.sort_order)
        .all()
    )
    return ok(data=_image_schema.dump(updated, many=True))
