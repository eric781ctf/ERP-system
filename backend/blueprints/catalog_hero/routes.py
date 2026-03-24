from flask import jsonify, request
from flask_jwt_extended import jwt_required
from extensions import db
from models.catalog_hero import CatalogHero
from . import bp


DEFAULT_TITLE = "探索優質布料與紡織品"
DEFAULT_DESCRIPTION = "專業布料供應，提供多元材質、豐富組織結構，滿足您的紡織製造需求。"


def ok(data=None, message="success", status=200):
    return jsonify({"success": True, "data": data, "message": message}), status


def err(message, status=400):
    return jsonify({"success": False, "data": None, "message": message}), status


def _hero_to_dict(hero: CatalogHero) -> dict:
    return {
        "id": hero.id,
        "title": hero.title,
        "description": hero.description,
    }


# ── Public ────────────────────────────────────────────────────────────────────

@bp.route("/catalog-hero", methods=["GET"])
def get_hero():
    hero = db.session.get(CatalogHero, 1)
    if hero is None:
        return ok(data={"title": DEFAULT_TITLE, "description": DEFAULT_DESCRIPTION})
    return ok(data=_hero_to_dict(hero))


# ── Protected ─────────────────────────────────────────────────────────────────

@bp.route("/admin/catalog-hero", methods=["PUT"])
@jwt_required()
def update_hero():
    body = request.get_json(force=True) or {}
    title = body.get("title", "")
    description = body.get("description", "")

    if not isinstance(title, str) or not title.strip():
        return err("標題不得為空", 400)
    if not isinstance(description, str) or not description.strip():
        return err("描述文字不得為空", 400)

    hero = db.session.get(CatalogHero, 1)
    if hero is None:
        hero = CatalogHero(id=1, title=title.strip(), description=description.strip())
        db.session.add(hero)
    else:
        hero.title = title.strip()
        hero.description = description.strip()

    db.session.commit()
    return ok(data=_hero_to_dict(hero), message="Hero 內容更新成功")
