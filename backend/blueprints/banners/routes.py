from flask import jsonify, request, current_app
from flask_jwt_extended import jwt_required
from sqlalchemy import text
from extensions import db
from models.banner import Banner
from . import bp


def ok(data=None, message="success", status=200):
    return jsonify({"success": True, "data": data, "message": message}), status


def err(message, status=400):
    return jsonify({"success": False, "data": None, "message": message}), status


def _banner_to_dict(b: Banner) -> dict:
    return {
        "id": b.id,
        "image_url": b.image_url,
        "alt_text": b.alt_text,
        "title": b.title,
        "description": b.description,
        "link_url": b.link_url,
        "sort_order": b.sort_order,
        "is_active": b.is_active,
    }


def _next_sort_order() -> int:
    """Return the next available sort_order value."""
    max_val = db.session.execute(
        text("SELECT COALESCE(MAX(sort_order), -1) FROM banners")
    ).scalar()
    return max_val + 1


# ── Public ────────────────────────────────────────────────────────────────────

@bp.route("", methods=["GET"])
def get_banners():
    banners = (
        Banner.query
        .filter_by(is_active=True)
        .order_by(Banner.sort_order)
        .all()
    )
    return ok(data=[_banner_to_dict(b) for b in banners])


# ── Protected ─────────────────────────────────────────────────────────────────

@bp.route("", methods=["POST"])
@jwt_required()
def create_banner():
    if "file" not in request.files:
        return err("請上傳圖片檔案", 400)

    file = request.files["file"]
    file_bytes = file.read()
    filename = file.filename or "upload.jpg"

    from services.s3_service import S3UploadService, ValidationError as S3Error
    try:
        url = S3UploadService().upload_banner_image(file_bytes, filename)
    except S3Error as e:
        return err(str(e), 400)
    except Exception as e:
        current_app.logger.error("S3 banner upload failed: %s", e)
        return err("圖片上傳失敗，請稍後再試", 500)

    sort_order = _next_sort_order()
    banner = Banner(
        image_url=url,
        alt_text=request.form.get("alt_text", ""),
        title=request.form.get("title") or None,
        description=request.form.get("description") or None,
        link_url=request.form.get("link_url") or None,
        sort_order=sort_order,
        is_active=request.form.get("is_active", "true").lower() != "false",
    )
    db.session.add(banner)
    try:
        db.session.commit()
    except Exception as e:
        current_app.logger.error("DB write failed after S3 banner upload: %s", e)
        S3UploadService().delete_image_by_url(url)
        db.session.rollback()
        return err("橫幅建立失敗，請稍後再試", 500)

    return ok(data=_banner_to_dict(banner), message="橫幅建立成功", status=201)


@bp.route("/<int:banner_id>", methods=["PUT"])
@jwt_required()
def update_banner(banner_id):
    banner = Banner.query.get(banner_id)
    if banner is None:
        return err("找不到該橫幅", 404)

    body = request.get_json(force=True) or {}
    updatable = ("alt_text", "title", "description", "link_url", "is_active")
    for field in updatable:
        if field in body:
            setattr(banner, field, body[field])

    db.session.commit()
    return ok(data=_banner_to_dict(banner), message="橫幅更新成功")


@bp.route("/reorder", methods=["PATCH"])
@jwt_required()
def reorder_banners():
    body = request.get_json(force=True) or {}
    order = body.get("order", [])
    if not order:
        return err("order 為必填", 400)

    # Validate all IDs exist
    existing_ids = {b.id for b in Banner.query.all()}
    for bid in order:
        if bid not in existing_ids:
            return err(f"橫幅 {bid} 不存在", 400)

    # Two-pass to avoid UNIQUE constraint conflicts
    for idx, bid in enumerate(order):
        db.session.execute(
            text("UPDATE banners SET sort_order = :s WHERE id = :id"),
            {"s": 1000 + idx, "id": bid},
        )
    for new_sort, bid in enumerate(order):
        db.session.execute(
            text("UPDATE banners SET sort_order = :s WHERE id = :id"),
            {"s": new_sort, "id": bid},
        )
    db.session.commit()
    db.session.expire_all()

    updated = Banner.query.order_by(Banner.sort_order).all()
    return ok(data=[_banner_to_dict(b) for b in updated])


@bp.route("/<int:banner_id>/toggle", methods=["PATCH"])
@jwt_required()
def toggle_banner(banner_id):
    banner = Banner.query.get(banner_id)
    if banner is None:
        return err("找不到該橫幅", 404)

    body = request.get_json(force=True) or {}
    if "is_active" not in body:
        return err("is_active 為必填", 400)

    banner.is_active = bool(body["is_active"])
    db.session.commit()
    return ok(data={"is_active": banner.is_active})


@bp.route("/<int:banner_id>", methods=["DELETE"])
@jwt_required()
def delete_banner(banner_id):
    banner = Banner.query.get(banner_id)
    if banner is None:
        return err("找不到該橫幅", 404)

    url = banner.image_url
    db.session.delete(banner)
    db.session.commit()

    try:
        from services.s3_service import S3UploadService
        S3UploadService().delete_image_by_url(url)
    except Exception as e:
        current_app.logger.error("S3 banner delete failed for %s: %s", url, e)

    return ok(message="橫幅已刪除")
