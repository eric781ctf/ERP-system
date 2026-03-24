from sqlalchemy.sql import func
from extensions import db


class Banner(db.Model):
    __tablename__ = "banners"

    id = db.Column(db.Integer, primary_key=True)
    image_url = db.Column(db.String(500), nullable=False)
    alt_text = db.Column(db.String(200), nullable=False, default="")
    title = db.Column(db.String(200), nullable=True)
    description = db.Column(db.String(500), nullable=True)
    link_url = db.Column(db.String(500), nullable=True)
    sort_order = db.Column(db.SmallInteger, nullable=False, default=0)
    is_active = db.Column(db.Boolean, nullable=False, default=True)
    created_at = db.Column(db.DateTime, nullable=False, server_default=func.now())
    updated_at = db.Column(
        db.DateTime, nullable=False, server_default=func.now(), onupdate=func.now()
    )

    __table_args__ = (
        db.UniqueConstraint("sort_order", name="uq_banner_sort_order"),
        db.Index("idx_banners_is_active_sort", "is_active", "sort_order"),
    )
