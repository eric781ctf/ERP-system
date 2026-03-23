"""Task 7 — auth 模組測試（Unit + Integration）"""
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


@pytest.fixture
def admin_user(app):
    """建立測試用管理員帳號，回傳 User 物件。"""
    from models.user import User
    with app.app_context():
        user = User(username="testadmin", is_active=True)
        user.set_password("correctpassword")
        _db.session.add(user)
        _db.session.commit()
        _db.session.refresh(user)
        return user


# ── Task 7.1 User model 單元測試 ───────────────────────────────────────────────

class TestUserModel:
    def test_set_and_check_password_correct(self, app):
        from models.user import User
        with app.app_context():
            user = User(username="u1", is_active=True)
            user.set_password("mysecret")
            assert user.check_password("mysecret") is True

    def test_check_password_wrong_returns_false(self, app):
        from models.user import User
        with app.app_context():
            user = User(username="u2", is_active=True)
            user.set_password("mysecret")
            assert user.check_password("wrongpassword") is False

    def test_password_hash_does_not_contain_plaintext(self, app):
        from models.user import User
        with app.app_context():
            user = User(username="u3", is_active=True)
            user.set_password("supersecret")
            assert "supersecret" not in user.password_hash


# ── Task 7.2 login 端點整合測試 ────────────────────────────────────────────────

class TestLoginEndpoint:
    def test_login_success_returns_tokens(self, client, admin_user):
        res = client.post("/api/v1/auth/login", json={
            "username": "testadmin",
            "password": "correctpassword",
        })
        assert res.status_code == 200
        data = res.get_json()
        assert data["success"] is True
        assert "access_token" in data["data"]
        assert "refresh_token" in data["data"]

    def test_login_wrong_password_returns_401(self, client, admin_user):
        res = client.post("/api/v1/auth/login", json={
            "username": "testadmin",
            "password": "wrongpassword",
        })
        assert res.status_code == 401
        data = res.get_json()
        assert data["success"] is False
        assert data["message"] == "帳號或密碼錯誤"

    def test_login_unknown_username_returns_401_same_message(self, client):
        res = client.post("/api/v1/auth/login", json={
            "username": "nobody",
            "password": "anything",
        })
        assert res.status_code == 401
        data = res.get_json()
        assert data["message"] == "帳號或密碼錯誤"

    def test_login_inactive_account_returns_401(self, client, app):
        from models.user import User
        with app.app_context():
            user = User(username="inactive", is_active=False)
            user.set_password("password")
            _db.session.add(user)
            _db.session.commit()

        res = client.post("/api/v1/auth/login", json={
            "username": "inactive",
            "password": "password",
        })
        assert res.status_code == 401
        assert res.get_json()["message"] == "帳號或密碼錯誤"

    def test_login_missing_username_returns_400(self, client):
        res = client.post("/api/v1/auth/login", json={"password": "pw"})
        assert res.status_code == 400

    def test_login_missing_password_returns_400(self, client):
        res = client.post("/api/v1/auth/login", json={"username": "admin"})
        assert res.status_code == 400

    def test_login_empty_body_returns_400(self, client):
        res = client.post("/api/v1/auth/login", json={})
        assert res.status_code == 400


# ── Task 7.3 refresh / logout / me 端點整合測試 ────────────────────────────────

class TestRefreshLogoutMe:
    def _login(self, client):
        res = client.post("/api/v1/auth/login", json={
            "username": "testadmin",
            "password": "correctpassword",
        })
        return res.get_json()["data"]

    def test_refresh_returns_new_access_token(self, client, admin_user):
        tokens = self._login(client)
        res = client.post("/api/v1/auth/refresh", headers={
            "Authorization": f"Bearer {tokens['refresh_token']}"
        })
        assert res.status_code == 200
        data = res.get_json()
        assert data["success"] is True
        assert "access_token" in data["data"]

    def test_refresh_with_access_token_returns_401(self, client, admin_user):
        tokens = self._login(client)
        res = client.post("/api/v1/auth/refresh", headers={
            "Authorization": f"Bearer {tokens['access_token']}"
        })
        assert res.status_code == 422

    def test_logout_then_reuse_token_returns_401(self, client, admin_user):
        tokens = self._login(client)
        access = tokens["access_token"]

        logout_res = client.post("/api/v1/auth/logout", headers={
            "Authorization": f"Bearer {access}"
        })
        assert logout_res.status_code == 200

        me_res = client.get("/api/v1/auth/me", headers={
            "Authorization": f"Bearer {access}"
        })
        assert me_res.status_code == 401

    def test_me_returns_user_info(self, client, admin_user):
        tokens = self._login(client)
        res = client.get("/api/v1/auth/me", headers={
            "Authorization": f"Bearer {tokens['access_token']}"
        })
        assert res.status_code == 200
        data = res.get_json()
        assert data["success"] is True
        assert data["data"]["username"] == "testadmin"
        assert data["data"]["is_active"] is True
        assert "password_hash" not in data["data"]

    def test_me_without_token_returns_401(self, client):
        res = client.get("/api/v1/auth/me")
        assert res.status_code == 401


# ── Task 7.4 products 端點 JWT 保護測試 ───────────────────────────────────────

class TestProductsJwtProtection:
    def _auth_header(self, app):
        from flask_jwt_extended import create_access_token
        with app.app_context():
            token = create_access_token(identity="1")
        return {"Authorization": f"Bearer {token}"}

    def test_create_product_without_jwt_returns_401(self, client):
        res = client.post("/api/v1/products", json={"name_zh": "test", "composition": "Cotton"})
        assert res.status_code == 401

    def test_update_product_without_jwt_returns_401(self, client):
        res = client.put("/api/v1/products/1", json={"name_zh": "x"})
        assert res.status_code == 401

    def test_delete_product_without_jwt_returns_401(self, client):
        res = client.delete("/api/v1/products/1")
        assert res.status_code == 401

    def test_toggle_publish_without_jwt_returns_401(self, client):
        res = client.patch("/api/v1/products/1/publish", json={"is_published": True})
        assert res.status_code == 401

    def test_get_products_without_jwt_returns_only_published(self, client, app):
        from models.product import FabricProduct
        with app.app_context():
            pub = FabricProduct(name_zh="已發布", composition="Cotton", is_published=True)
            draft = FabricProduct(name_zh="草稿", composition="Wool", is_published=False)
            _db.session.add_all([pub, draft])
            _db.session.commit()

        res = client.get("/api/v1/products")
        assert res.status_code == 200
        names = [p["name_zh"] for p in res.get_json()["data"]]
        assert "已發布" in names
        assert "草稿" not in names

    def test_get_products_with_jwt_returns_drafts(self, client, app):
        from models.product import FabricProduct
        with app.app_context():
            pub = FabricProduct(name_zh="已發布", composition="Cotton", is_published=True)
            draft = FabricProduct(name_zh="草稿", composition="Wool", is_published=False)
            _db.session.add_all([pub, draft])
            _db.session.commit()

        res = client.get("/api/v1/products", headers=self._auth_header(app))
        assert res.status_code == 200
        names = [p["name_zh"] for p in res.get_json()["data"]]
        assert "已發布" in names
        assert "草稿" in names
