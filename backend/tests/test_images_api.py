"""Task 4.2 / 4.3 / 4.4 — 圖片 API 測試"""
import io
import pytest
from unittest.mock import patch
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


def seed_product(app):
    with app.app_context():
        from models.product import FabricProduct
        p = FabricProduct(name_zh="測試布", composition="Cotton")
        _db.session.add(p)
        _db.session.commit()
        return p.id


def seed_images(app, product_id, count):
    with app.app_context():
        from models.product_image import ProductImage
        ids = []
        for i in range(count):
            img = ProductImage(
                product_id=product_id,
                url=f"https://s3.example.com/img{i}.jpg",
                sort_order=i,
            )
            _db.session.add(img)
        _db.session.commit()
        from models.product_image import ProductImage
        imgs = ProductImage.query.filter_by(product_id=product_id).order_by(ProductImage.sort_order).all()
        return [img.id for img in imgs]


FAKE_JPG = b"\xff\xd8\xff" + b"x" * 100  # minimal JPEG magic bytes


# ── Task 4.2 圖片上傳 ─────────────────────────────────────────────────────────

class TestImageUploadAPI:
    def test_upload_requires_jwt(self, client, app):
        pid = seed_product(app)
        data = {"file": (io.BytesIO(FAKE_JPG), "photo.jpg")}
        res = client.post(f"/api/v1/products/{pid}/images",
                          data=data, content_type="multipart/form-data")
        assert res.status_code == 401

    def test_upload_succeeds(self, client, app):
        pid = seed_product(app)
        headers = make_auth_header(app)
        data = {"file": (io.BytesIO(FAKE_JPG), "photo.jpg")}
        with patch("services.s3_service.S3UploadService.upload_image",
                   return_value="https://cdn.example.com/img.jpg"):
            res = client.post(f"/api/v1/products/{pid}/images",
                              data=data, content_type="multipart/form-data",
                              headers=headers)
        assert res.status_code == 201
        body = res.get_json()
        assert body["data"]["url"] == "https://cdn.example.com/img.jpg"
        assert body["data"]["sort_order"] == 0

    def test_upload_rejects_seventh_image(self, client, app):
        pid = seed_product(app)
        seed_images(app, pid, 6)
        headers = make_auth_header(app)
        data = {"file": (io.BytesIO(FAKE_JPG), "photo.jpg")}
        with patch("services.s3_service.S3UploadService.upload_image",
                   return_value="https://cdn.example.com/img7.jpg"):
            res = client.post(f"/api/v1/products/{pid}/images",
                              data=data, content_type="multipart/form-data",
                              headers=headers)
        assert res.status_code == 422

    def test_upload_nonexistent_product_returns_404(self, client, app):
        headers = make_auth_header(app)
        data = {"file": (io.BytesIO(FAKE_JPG), "photo.jpg")}
        res = client.post("/api/v1/products/99999/images",
                          data=data, content_type="multipart/form-data",
                          headers=headers)
        assert res.status_code == 404

    def test_upload_missing_file_returns_400(self, client, app):
        pid = seed_product(app)
        headers = make_auth_header(app)
        res = client.post(f"/api/v1/products/{pid}/images",
                          data={}, content_type="multipart/form-data",
                          headers=headers)
        assert res.status_code == 400


# ── Task 4.3 圖片刪除 ─────────────────────────────────────────────────────────

class TestImageDeleteAPI:
    def test_delete_image_requires_jwt(self, client, app):
        pid = seed_product(app)
        img_ids = seed_images(app, pid, 2)
        res = client.delete(f"/api/v1/products/{pid}/images/{img_ids[0]}")
        assert res.status_code == 401

    def test_delete_image_succeeds(self, client, app):
        pid = seed_product(app)
        img_ids = seed_images(app, pid, 3)
        headers = make_auth_header(app)
        with patch("services.s3_service.S3UploadService.delete_image"):
            res = client.delete(f"/api/v1/products/{pid}/images/{img_ids[1]}",
                                headers=headers)
        assert res.status_code == 200

    def test_delete_reorders_remaining_images(self, client, app):
        pid = seed_product(app)
        img_ids = seed_images(app, pid, 3)  # sort_order: 0,1,2
        headers = make_auth_header(app)
        with patch("services.s3_service.S3UploadService.delete_image"):
            client.delete(f"/api/v1/products/{pid}/images/{img_ids[0]}",
                          headers=headers)  # delete sort_order=0

        with app.app_context():
            from models.product_image import ProductImage
            remaining = ProductImage.query.filter_by(product_id=pid)\
                .order_by(ProductImage.sort_order).all()
            assert [img.sort_order for img in remaining] == [0, 1]


# ── Task 4.4 圖片排序 ─────────────────────────────────────────────────────────

class TestImageReorderAPI:
    def test_reorder_requires_jwt(self, client, app):
        pid = seed_product(app)
        img_ids = seed_images(app, pid, 2)
        res = client.patch(f"/api/v1/products/{pid}/images/reorder",
                           json={"order": img_ids})
        assert res.status_code == 401

    def test_reorder_succeeds(self, client, app):
        pid = seed_product(app)
        img_ids = seed_images(app, pid, 3)  # originally [id0,id1,id2] with sort_order 0,1,2
        headers = make_auth_header(app)
        new_order = [img_ids[2], img_ids[0], img_ids[1]]
        res = client.patch(f"/api/v1/products/{pid}/images/reorder",
                           json={"order": new_order}, headers=headers)
        assert res.status_code == 200
        result = res.get_json()["data"]
        assert result[0]["id"] == img_ids[2]
        assert result[0]["sort_order"] == 0

    def test_reorder_rejects_foreign_image_ids(self, client, app):
        pid1 = seed_product(app)
        pid2 = seed_product(app)
        img_ids_p2 = seed_images(app, pid2, 2)
        headers = make_auth_header(app)
        res = client.patch(f"/api/v1/products/{pid1}/images/reorder",
                           json={"order": img_ids_p2}, headers=headers)
        assert res.status_code == 400
