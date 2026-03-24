"""Task 7 — Banner API 整合測試"""
import io
import pytest
from unittest.mock import patch, MagicMock
from app import create_app
from extensions import db as _db


@pytest.fixture
def app():
    app = create_app("testing")
    with app.app_context():
        _db.create_all()
        yield app
        _db.session.remove()
        _db.drop_all()


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def auth_headers(client):
    """Log in and return JWT auth headers."""
    from models.user import User
    from extensions import db
    with client.application.app_context():
        user = User(username="testadmin", is_active=True)
        user.set_password("testpass")
        db.session.add(user)
        db.session.commit()

    res = client.post(
        "/api/v1/auth/login",
        json={"username": "testadmin", "password": "testpass"},
    )
    token = res.get_json()["data"]["access_token"]
    return {"Authorization": f"Bearer {token}"}


def _seed_banner(app, sort_order=0, is_active=True):
    from models.banner import Banner
    with app.app_context():
        b = Banner(
            image_url="https://cdn.example.com/banners/test.jpg",
            sort_order=sort_order,
            is_active=is_active,
        )
        _db.session.add(b)
        _db.session.commit()
        return b.id


# ── GET /api/v1/banners ───────────────────────────────────────────────────────

class TestGetBanners:
    def test_returns_only_active_banners(self, client, app):
        _seed_banner(app, sort_order=0, is_active=True)
        _seed_banner(app, sort_order=1, is_active=False)

        res = client.get("/api/v1/banners")
        assert res.status_code == 200
        data = res.get_json()
        assert data["success"] is True
        assert len(data["data"]) == 1
        assert data["data"][0]["is_active"] is True

    def test_returns_banners_sorted_by_sort_order(self, client, app):
        _seed_banner(app, sort_order=2)
        _seed_banner(app, sort_order=0)
        _seed_banner(app, sort_order=1)

        res = client.get("/api/v1/banners")
        orders = [b["sort_order"] for b in res.get_json()["data"]]
        assert orders == sorted(orders)

    def test_returns_empty_list_when_no_banners(self, client):
        res = client.get("/api/v1/banners")
        assert res.status_code == 200
        assert res.get_json()["data"] == []


# ── POST /api/v1/banners ──────────────────────────────────────────────────────

class TestCreateBanner:
    @patch("services.s3_service.S3UploadService._upload_to_s3")
    def test_create_banner_requires_auth(self, _, client):
        res = client.post("/api/v1/banners", data={})
        assert res.status_code == 401

    @patch("services.s3_service.S3UploadService._upload_to_s3")
    def test_create_banner_requires_file(self, _, client, auth_headers):
        res = client.post("/api/v1/banners", headers=auth_headers, data={})
        assert res.status_code == 400

    @patch("services.s3_service.S3UploadService._upload_to_s3")
    def test_create_banner_success(self, mock_upload, client, auth_headers):
        mock_upload.return_value = "https://cdn.example.com/banners/new.jpg"
        data = {
            "file": (io.BytesIO(b"fake-jpg-data"), "banner.jpg"),
            "title": "夏季新品",
            "alt_text": "夏季橫幅",
        }
        res = client.post(
            "/api/v1/banners",
            headers=auth_headers,
            data=data,
            content_type="multipart/form-data",
        )
        assert res.status_code == 201
        body = res.get_json()
        assert body["success"] is True
        assert body["data"]["title"] == "夏季新品"
        assert body["data"]["image_url"] == "https://cdn.example.com/banners/new.jpg"


# ── DELETE /api/v1/banners/:id ────────────────────────────────────────────────

class TestDeleteBanner:
    @patch("services.s3_service.S3UploadService.delete_image_by_url")
    def test_delete_banner_removes_record(self, mock_delete, client, auth_headers, app):
        bid = _seed_banner(app, sort_order=10)

        res = client.delete(f"/api/v1/banners/{bid}", headers=auth_headers)
        assert res.status_code == 200
        assert res.get_json()["success"] is True
        mock_delete.assert_called_once()

    def test_delete_nonexistent_returns_404(self, client, auth_headers):
        res = client.delete("/api/v1/banners/9999", headers=auth_headers)
        assert res.status_code == 404


# ── PATCH /api/v1/banners/reorder ─────────────────────────────────────────────

class TestReorderBanners:
    def test_reorder_updates_sort_order(self, client, auth_headers, app):
        id1 = _seed_banner(app, sort_order=0)
        id2 = _seed_banner(app, sort_order=1)
        id3 = _seed_banner(app, sort_order=2)

        res = client.patch(
            "/api/v1/banners/reorder",
            headers=auth_headers,
            json={"order": [id3, id1, id2]},
        )
        assert res.status_code == 200
        result_ids = [b["id"] for b in res.get_json()["data"]]
        assert result_ids == [id3, id1, id2]
