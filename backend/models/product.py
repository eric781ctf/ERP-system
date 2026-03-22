from sqlalchemy.sql import func
from extensions import db
from models.tag import product_tags


class FabricProduct(db.Model):
    __tablename__ = "fabric_products"

    id = db.Column(db.Integer, primary_key=True)
    name_zh = db.Column(db.String(200), nullable=False)
    name_en = db.Column(db.String(200), nullable=True)
    description_zh = db.Column(db.Text, nullable=True)
    description_en = db.Column(db.Text, nullable=True)
    composition = db.Column(db.String(200), nullable=False)
    yarn_count = db.Column(db.String(50), nullable=True)
    density = db.Column(db.String(100), nullable=True)
    weight_gsm = db.Column(db.Integer, nullable=True)
    width = db.Column(db.String(50), nullable=True)
    weave_structure = db.Column(db.String(100), nullable=True)
    is_published = db.Column(db.Boolean, nullable=False, default=False)
    created_at = db.Column(db.DateTime, nullable=False, server_default=func.now())
    updated_at = db.Column(
        db.DateTime, nullable=False, server_default=func.now(), onupdate=func.now()
    )

    images = db.relationship(
        "ProductImage", backref="product", cascade="all, delete-orphan",
        order_by="ProductImage.sort_order",
    )
    tags = db.relationship("Tag", secondary=product_tags, backref="products")

    __table_args__ = (
        db.Index("idx_products_published", "is_published"),
    )
