from sqlalchemy.sql import func
from extensions import db


class Contact(db.Model):
    __tablename__ = "contacts"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False, index=True)
    phone = db.Column(db.String(50), nullable=True)
    fax = db.Column(db.String(50), nullable=True)
    tax_id = db.Column(db.String(20), nullable=True)
    contact_methods = db.Column(db.JSON, nullable=True)
    email = db.Column(db.String(254), nullable=True)
    type = db.Column(db.String(20), nullable=True)
    note = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, server_default=func.now())
