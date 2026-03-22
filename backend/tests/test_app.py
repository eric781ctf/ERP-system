"""Task 1.1 — Flask 應用程式骨架測試"""
import pytest
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager


def test_create_app_returns_flask_instance(app):
    """create_app() 應回傳 Flask 實例"""
    assert isinstance(app, Flask)


def test_create_app_testing_config(app):
    """create_app('testing') 應開啟 TESTING 模式"""
    assert app.config["TESTING"] is True


def test_db_extension_initialized(app):
    """SQLAlchemy db 應在 app context 中正常初始化"""
    from extensions import db
    assert isinstance(db, SQLAlchemy)
    with app.app_context():
        assert db.engine is not None


def test_migrate_extension_initialized(app):
    """Flask-Migrate 應正確掛載"""
    from extensions import migrate
    assert isinstance(migrate, Migrate)


def test_jwt_extension_initialized(app):
    """Flask-JWT-Extended 應正確掛載"""
    from extensions import jwt
    assert isinstance(jwt, JWTManager)


def test_products_blueprint_registered(app):
    """products Blueprint 應以 /api/v1/products 為前綴註冊"""
    rules = [str(rule) for rule in app.url_map.iter_rules()]
    assert any(rule.startswith("/api/v1/products") for rule in rules)


def test_get_products_standard_response_format(client):
    """GET /api/v1/products 應回傳統一格式 {success, data, message}"""
    response = client.get("/api/v1/products")
    data = response.get_json()
    assert "success" in data
    assert "data" in data
    assert "message" in data


def test_get_products_returns_success_true(client):
    """GET /api/v1/products 正常情況 success 應為 True"""
    response = client.get("/api/v1/products")
    data = response.get_json()
    assert data["success"] is True
    assert response.status_code == 200
