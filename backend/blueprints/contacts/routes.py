from flask import jsonify, request
from flask_jwt_extended import jwt_required
from marshmallow import ValidationError

from extensions import db
from models.contact import Contact
from schemas.contact_schema import ContactSchema
from . import bp

_schema = ContactSchema()


def ok(data=None, message="success", status=200):
    return jsonify({"success": True, "data": data, "message": message}), status


def err(message, status=400):
    return jsonify({"success": False, "data": None, "message": message}), status


# ── Task 2.1 GET 列表 ─────────────────────────────────────────────────────────

@bp.get("")
@jwt_required()
def get_contacts():
    query = db.select(Contact)

    type_param = request.args.get("type")
    if type_param:
        query = query.filter(Contact.type == type_param)

    search_param = request.args.get("search")
    if search_param:
        query = query.filter(Contact.name.ilike(f"%{search_param}%"))

    query = query.order_by(Contact.name)
    contacts = db.session.execute(query).scalars().all()
    return ok(data=_schema.dump(contacts, many=True))


# ── Task 2.2 POST 新增 ────────────────────────────────────────────────────────

@bp.post("")
@jwt_required()
def create_contact():
    try:
        data = _schema.load(request.get_json(force=True) or {})
    except ValidationError as e:
        return err(e.messages, 400)

    contact = Contact(**data)
    db.session.add(contact)
    db.session.commit()
    return ok(data=_schema.dump(contact), message="聯絡人建立成功", status=201)


# ── Task 2.3 PUT 更新 ─────────────────────────────────────────────────────────

@bp.put("/<int:contact_id>")
@jwt_required()
def update_contact(contact_id):
    contact = db.session.get(Contact, contact_id)
    if contact is None:
        return err("找不到此聯絡人", 404)

    try:
        data = ContactSchema(partial=True).load(request.get_json(force=True) or {})
    except ValidationError as e:
        return err(e.messages, 400)

    for key, value in data.items():
        setattr(contact, key, value)

    db.session.commit()
    return ok(data=_schema.dump(contact), message="聯絡人更新成功")


# ── Task 2.4 DELETE 刪除 ──────────────────────────────────────────────────────

@bp.delete("/<int:contact_id>")
@jwt_required()
def delete_contact(contact_id):
    contact = db.session.get(Contact, contact_id)
    if contact is None:
        return err("找不到此聯絡人", 404)

    db.session.delete(contact)
    db.session.commit()
    return ok(message="聯絡人已刪除")
