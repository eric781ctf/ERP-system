from flask import jsonify, request
from flask_jwt_extended import jwt_required
from marshmallow import ValidationError

from extensions import db
from models.about_us import AboutUs
from schemas.about_us_schema import AboutUsSchema
from . import bp

_schema = AboutUsSchema()


def ok(data=None, message="success", status=200):
    return jsonify({"success": True, "data": data, "message": message}), status


def err(message, status=400):
    return jsonify({"success": False, "data": None, "message": message}), status


# ── GET 公開端點 ────────────────────────────────────────────────────────────────

@bp.get("/about-us")
def get_about_us():
    record = db.session.get(AboutUs, 1)
    if record is None:
        return ok(data=None)
    return ok(data=_schema.dump(record))


# ── PUT 受保護端點 ──────────────────────────────────────────────────────────────

@bp.put("/admin/about-us")
@jwt_required()
def update_about_us():
    try:
        data = _schema.load(request.get_json(force=True) or {})
    except ValidationError as e:
        return err(e.messages, 400)

    record = db.session.get(AboutUs, 1)
    if record is None:
        record = AboutUs(id=1)
        db.session.add(record)

    for key, value in data.items():
        setattr(record, key, value)

    db.session.commit()
    return ok(data=_schema.dump(record), message="儲存成功")
