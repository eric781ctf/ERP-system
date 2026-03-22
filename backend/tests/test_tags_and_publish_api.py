"""Task 5.1 / 5.2 — Tag 公開查詢 & 發布狀態 API 測試"""
import pytest
from app import create_app
from extensions import db as _db


@pytest.fixture()
def app():
    _app = create_app("testing")
    with _app.app_context():
        _db.create_all()
        yield _app
        _db.session.remove()
        _db.drop_all()


@pytest.fixture
def client(app):
    return app.test_client()


def make_auth_header(app):
    from flask_jwt_extended import create_access_token
    with app.app_context():
        token = create_access_token(identity="staff")
    return {"Authorization": f"Bearer {token}"}


def seed(app, *, published=True, tags=None):
    with app.app_context():
        from models.product import FabricProduct
        from models.tag import Tag
        p = FabricProduct(name_zh="布", composition="Cotton", is_published=published)
        for name in (tags or []):
            t = Tag.query.filter_by(name=name).first() or Tag(name=name)
            _db.session.add(t)
            p.tags.append(t)
        _db.session.add(p)
        _db.session.commit()
        return p.id


# ── Task 5.1 Tag 公開查詢 ─────────────────────────────────────────────────────

class TestTagsAPI:
    def test_get_tags_returns_200(self, client):
        res = client.get("/api/v1/tags")
        assert res.status_code == 200
        data = res.get_json()
        assert data["success"] is True
        assert isinstance(data["data"], list)

    def test_only_returns_tags_with_published_products(self, client, app):
        seed(app, published=True, tags=["素色"])
        seed(app, published=False, tags=["孤立tag"])

        res = client.get("/api/v1/tags")
        tags = res.get_json()["data"]
        assert "素色" in tags
        assert "孤立tag" not in tags

    def test_tag_disappears_when_all_products_unpublished(self, client, app):
        pid = seed(app, published=True, tags=["消失tag"])

        # Unpublish the product via API
        headers = make_auth_header(app)
        client.patch(f"/api/v1/products/{pid}/publish",
                     json={"is_published": False}, headers=headers)

        res = client.get("/api/v1/tags")
        tags = res.get_json()["data"]
        assert "消失tag" not in tags

    def test_no_duplicate_tags_returned(self, client, app):
        seed(app, published=True, tags=["平紋"])
        seed(app, published=True, tags=["平紋"])

        res = client.get("/api/v1/tags")
        tags = res.get_json()["data"]
        assert tags.count("平紋") == 1

    def test_returns_empty_list_when_no_published_products(self, client):
        res = client.get("/api/v1/tags")
        assert res.get_json()["data"] == []


# ── Task 5.2 發布狀態切換 ─────────────────────────────────────────────────────

class TestPublishAPI:
    def test_publish_requires_jwt(self, client, app):
        pid = seed(app, published=False)
        res = client.patch(f"/api/v1/products/{pid}/publish",
                           json={"is_published": True})
        assert res.status_code == 401

    def test_publish_product(self, client, app):
        pid = seed(app, published=False)
        headers = make_auth_header(app)
        res = client.patch(f"/api/v1/products/{pid}/publish",
                           json={"is_published": True}, headers=headers)
        assert res.status_code == 200
        assert res.get_json()["data"]["is_published"] is True

    def test_unpublish_product(self, client, app):
        pid = seed(app, published=True)
        headers = make_auth_header(app)
        res = client.patch(f"/api/v1/products/{pid}/publish",
                           json={"is_published": False}, headers=headers)
        assert res.status_code == 200
        assert res.get_json()["data"]["is_published"] is False

    def test_published_product_visible_in_public_api(self, client, app):
        pid = seed(app, published=False)
        headers = make_auth_header(app)
        client.patch(f"/api/v1/products/{pid}/publish",
                     json={"is_published": True}, headers=headers)

        res = client.get("/api/v1/products")
        ids = [p["id"] for p in res.get_json()["data"]]
        assert pid in ids

    def test_unpublished_product_hidden_from_public_api(self, client, app):
        pid = seed(app, published=True)
        headers = make_auth_header(app)
        client.patch(f"/api/v1/products/{pid}/publish",
                     json={"is_published": False}, headers=headers)

        res = client.get("/api/v1/products")
        ids = [p["id"] for p in res.get_json()["data"]]
        assert pid not in ids

    def test_publish_nonexistent_product_returns_404(self, client, app):
        headers = make_auth_header(app)
        res = client.patch("/api/v1/products/99999/publish",
                           json={"is_published": True}, headers=headers)
        assert res.status_code == 404

    def test_publish_missing_body_returns_400(self, client, app):
        pid = seed(app, published=False)
        headers = make_auth_header(app)
        res = client.patch(f"/api/v1/products/{pid}/publish",
                           json={}, headers=headers)
        assert res.status_code == 400
