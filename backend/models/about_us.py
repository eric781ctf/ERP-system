from sqlalchemy.sql import func
from extensions import db


class AboutUs(db.Model):
    __tablename__ = "about_us"

    id = db.Column(db.Integer, primary_key=True)
    company_intro_zh = db.Column(db.Text, nullable=True)
    company_intro_en = db.Column(db.Text, nullable=True)
    brand_story_zh = db.Column(db.Text, nullable=True)
    brand_story_en = db.Column(db.Text, nullable=True)
    contact_info_zh = db.Column(db.String(500), nullable=True)
    contact_info_en = db.Column(db.String(500), nullable=True)
    fax = db.Column(db.String(100), nullable=True)
    address_zh = db.Column(db.String(500), nullable=True)
    address_en = db.Column(db.String(500), nullable=True)
    business_hours_zh = db.Column(db.String(200), nullable=True)
    business_hours_en = db.Column(db.String(200), nullable=True)
    email = db.Column(db.String(200), nullable=True)
    updated_at = db.Column(
        db.DateTime,
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )
