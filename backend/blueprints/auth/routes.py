from flask import jsonify, request
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    get_jwt,
    get_jwt_identity,
    jwt_required,
)

from extensions import db
from models.user import TokenBlocklist, User
from . import bp


def ok(data=None, status=200):
    return jsonify({"success": True, "data": data}), status


def err(message, status=400):
    return jsonify({"success": False, "message": message}), status


@bp.post("/login")
def login():
    body = request.get_json(silent=True) or {}
    username = body.get("username")
    password = body.get("password")

    if not username or not password:
        return err("username 與 password 為必填欄位", status=400)

    user = db.session.execute(
        db.select(User).filter_by(username=username)
    ).scalar_one_or_none()

    if not user or not user.check_password(password) or not user.is_active:
        return err("帳號或密碼錯誤", status=401)

    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))

    return ok({"access_token": access_token, "refresh_token": refresh_token})


@bp.post("/refresh")
@jwt_required(refresh=True)
def refresh():
    user_id = get_jwt_identity()
    access_token = create_access_token(identity=user_id)
    return ok({"access_token": access_token})


@bp.post("/logout")
@jwt_required()
def logout():
    jti = get_jwt()["jti"]
    db.session.add(TokenBlocklist(jti=jti))
    db.session.commit()
    return ok()


@bp.get("/me")
@jwt_required()
def me():
    user_id = get_jwt_identity()
    user = db.session.get(User, int(user_id))
    if not user:
        return err("使用者不存在", status=401)
    return ok({"username": user.username, "is_active": user.is_active})
