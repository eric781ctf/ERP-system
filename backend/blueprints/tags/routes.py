from flask import jsonify
from extensions import db
from models.tag import Tag
from models.product import FabricProduct
from models.tag import product_tags
from . import bp


def ok(data=None, message="success"):
    return jsonify({"success": True, "data": data, "message": message}), 200


@bp.route("", methods=["GET"])
def get_tags():
    """Return tags that have at least one published product (no orphan tags)."""
    tags = (
        db.session.query(Tag.name)
        .join(product_tags, Tag.id == product_tags.c.tag_id)
        .join(FabricProduct, FabricProduct.id == product_tags.c.product_id)
        .filter(FabricProduct.is_published.is_(True))
        .distinct()
        .all()
    )
    return ok(data=[t.name for t in tags])
