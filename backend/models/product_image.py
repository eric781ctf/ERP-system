from sqlalchemy.sql import func
from extensions import db


class ProductImage(db.Model):
    __tablename__ = "product_images"

    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(
        db.Integer,
        db.ForeignKey("fabric_products.id", ondelete="CASCADE"),
        nullable=False,
    )
    url = db.Column(db.String(500), nullable=False)
    sort_order = db.Column(
        db.SmallInteger,
        nullable=False,
        doc="0–5; 0 is the cover image",
    )
    created_at = db.Column(db.DateTime, nullable=False, server_default=func.now())

    __table_args__ = (
        db.UniqueConstraint("product_id", "sort_order", name="uq_product_sort_order"),
        # Note: range 0-5 is enforced at application level (upload limit + reorder logic)
        # so we avoid a DB CHECK constraint that conflicts with SQLite's per-row checking.
        db.Index("idx_product_images_product_id", "product_id"),
    )
