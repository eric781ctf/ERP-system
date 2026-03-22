"""Task 3.1 / 3.2 / 3.3 — 產品 CRUD API 測試"""
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


# ── Task 3.1 公開產品查詢 ──────────────────────────────────────────────────────

class TestPublicProductsAPI:
    def test_get_products_returns_200(self, client):
        res = client.get("/api/v1/products")
        assert res.status_code == 200
        data = res.get_json()
        assert data["success"] is True
        assert isinstance(data["data"], list)

    def test_get_products_only_returns_published(self, client, app):
        with app.app_context():
            from models.product import FabricProduct
            pub = FabricProduct(name_zh="已發布", composition="Cotton", is_published=True)
            draft = FabricProduct(name_zh="草稿", composition="Wool", is_published=False)
            _db.session.add_all([pub, draft])
            _db.session.commit()

        res = client.get("/api/v1/products")
        data = res.get_json()
        names = [p["name_zh"] for p in data["data"]]
        assert "已發布" in names
        assert "草稿" not in names

    def test_get_products_includes_cover_image_url(self, client, app):
        with app.app_context():
            from models.product import FabricProduct
            from models.product_image import ProductImage
            p = FabricProduct(name_zh="有圖片產品", composition="Silk", is_published=True)
            _db.session.add(p)
            _db.session.flush()
            img = ProductImage(product_id=p.id, url="https://cdn.example.com/x.jpg", sort_order=0)
            _db.session.add(img)
            _db.session.commit()

        res = client.get("/api/v1/products")
        data = res.get_json()
        product = next(p for p in data["data"] if p["name_zh"] == "有圖片產品")
        assert product["cover_image_url"] == "https://cdn.example.com/x.jpg"

    def test_get_products_filter_by_tag(self, client, app):
        with app.app_context():
            from models.product import FabricProduct
            from models.tag import Tag
            t = Tag(name="素色")
            p1 = FabricProduct(name_zh="素色布", composition="Polyester", is_published=True)
            p2 = FabricProduct(name_zh="花紋布", composition="Nylon", is_published=True)
            p1.tags.append(t)
            _db.session.add_all([p1, p2])
            _db.session.commit()

        res = client.get("/api/v1/products?tags=素色")
        data = res.get_json()
        names = [p["name_zh"] for p in data["data"]]
        assert "素色布" in names
        assert "花紋布" not in names

    def test_get_product_detail_returns_200(self, client, app):
        with app.app_context():
            from models.product import FabricProduct
            p = FabricProduct(name_zh="詳細頁", composition="Linen", is_published=True)
            _db.session.add(p)
            _db.session.commit()
            pid = p.id

        res = client.get(f"/api/v1/products/{pid}")
        assert res.status_code == 200
        data = res.get_json()
        assert data["data"]["name_zh"] == "詳細頁"

    def test_get_product_detail_404_for_missing(self, client):
        res = client.get("/api/v1/products/99999")
        assert res.status_code == 404


# ── Task 3.2 後台新增與更新 ───────────────────────────────────────────────────

class TestAdminProductCRUD:
    def test_create_product_requires_jwt(self, client):
        res = client.post("/api/v1/products", json={"name_zh": "X", "composition": "Y"})
        assert res.status_code == 401

    def test_create_product_succeeds_with_jwt(self, client, app):
        headers = make_auth_header(app)
        res = client.post(
            "/api/v1/products",
            json={"name_zh": "新產品", "composition": "100% Cotton"},
            headers=headers,
        )
        assert res.status_code == 201
        data = res.get_json()
        assert data["data"]["name_zh"] == "新產品"
        assert data["data"]["is_published"] is False

    def test_create_product_missing_composition_returns_400(self, client, app):
        headers = make_auth_header(app)
        res = client.post("/api/v1/products", json={"name_zh": "缺成份"}, headers=headers)
        assert res.status_code == 400

    def test_create_product_auto_creates_tags(self, client, app):
        headers = make_auth_header(app)
        res = client.post(
            "/api/v1/products",
            json={"name_zh": "有標籤", "composition": "Polyester", "tags": ["新tag"]},
            headers=headers,
        )
        assert res.status_code == 201
        assert "新tag" in res.get_json()["data"]["tags"]

    def test_create_product_normalizes_tag_case(self, client, app):
        headers = make_auth_header(app)
        res = client.post(
            "/api/v1/products",
            json={"name_zh": "大小寫", "composition": "Cotton", "tags": ["  TAG  "]},
            headers=headers,
        )
        assert res.status_code == 201
        assert "tag" in res.get_json()["data"]["tags"]

    def test_update_product_requires_jwt(self, client, app):
        with app.app_context():
            from models.product import FabricProduct
            p = FabricProduct(name_zh="舊名", composition="棉")
            _db.session.add(p)
            _db.session.commit()
            pid = p.id
        res = client.put(f"/api/v1/products/{pid}", json={"name_zh": "新名"})
        assert res.status_code == 401

    def test_update_product_succeeds(self, client, app):
        with app.app_context():
            from models.product import FabricProduct
            p = FabricProduct(name_zh="原名稱", composition="麻")
            _db.session.add(p)
            _db.session.commit()
            pid = p.id

        headers = make_auth_header(app)
        res = client.put(
            f"/api/v1/products/{pid}",
            json={"name_zh": "更新後名稱", "composition": "麻"},
            headers=headers,
        )
        assert res.status_code == 200
        assert res.get_json()["data"]["name_zh"] == "更新後名稱"


# ── Task 3.3 產品刪除 ─────────────────────────────────────────────────────────

class TestDeleteProduct:
    def test_delete_requires_jwt(self, client, app):
        with app.app_context():
            from models.product import FabricProduct
            p = FabricProduct(name_zh="刪除測試", composition="X")
            _db.session.add(p)
            _db.session.commit()
            pid = p.id
        res = client.delete(f"/api/v1/products/{pid}")
        assert res.status_code == 401

    def test_delete_product_succeeds(self, client, app):
        with app.app_context():
            from models.product import FabricProduct
            p = FabricProduct(name_zh="待刪除", composition="Y")
            _db.session.add(p)
            _db.session.commit()
            pid = p.id

        headers = make_auth_header(app)
        res = client.delete(f"/api/v1/products/{pid}", headers=headers)
        assert res.status_code == 200
        assert res.get_json()["success"] is True

    def test_delete_product_cascades_images(self, client, app):
        with app.app_context():
            from models.product import FabricProduct
            from models.product_image import ProductImage
            p = FabricProduct(name_zh="含圖片", composition="Z")
            _db.session.add(p)
            _db.session.flush()
            img = ProductImage(product_id=p.id, url="https://s3.example.com/img.jpg", sort_order=0)
            _db.session.add(img)
            _db.session.commit()
            pid, img_id = p.id, img.id

        headers = make_auth_header(app)
        client.delete(f"/api/v1/products/{pid}", headers=headers)

        with app.app_context():
            from models.product_image import ProductImage
            assert _db.session.get(ProductImage, img_id) is None

    def test_delete_nonexistent_returns_404(self, client, app):
        headers = make_auth_header(app)
        res = client.delete("/api/v1/products/99999", headers=headers)
        assert res.status_code == 404
