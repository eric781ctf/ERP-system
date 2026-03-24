from sqlalchemy.sql import func
from extensions import db


class CatalogHero(db.Model):
    __tablename__ = "catalog_hero"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(500), nullable=False, default="")
    description = db.Column(db.String(2000), nullable=False, default="")
    updated_at = db.Column(
        db.DateTime, nullable=False, server_default=func.now(), onupdate=func.now()
    )
