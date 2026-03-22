"""Task 4.1 — S3 Upload Service 單元測試"""
import pytest
from unittest.mock import MagicMock, patch
from services.s3_service import S3UploadService, ValidationError as S3ValidationError


def make_fake_file(content=b"x" * 100, mime="image/jpeg", filename="photo.jpg"):
    return content, filename


class TestS3UploadServiceValidation:
    def test_rejects_webp_format(self):
        svc = S3UploadService()
        with pytest.raises(S3ValidationError, match="JPG.*PNG"):
            svc.upload_image(b"fake", "photo.webp", product_id=1)

    def test_rejects_pdf_format(self):
        svc = S3UploadService()
        with pytest.raises(S3ValidationError):
            svc.upload_image(b"fake", "file.pdf", product_id=1)

    def test_rejects_file_over_5mb(self):
        svc = S3UploadService()
        big = b"x" * (5 * 1024 * 1024 + 1)
        with pytest.raises(S3ValidationError, match="5MB"):
            svc.upload_image(big, "photo.jpg", product_id=1)

    def test_accepts_jpg_extension(self):
        svc = S3UploadService()
        fake_bytes = b"\xff\xd8\xff" + b"x" * 100  # JPEG magic bytes
        with patch.object(svc, "_upload_to_s3", return_value="https://cdn.example.com/a.jpg"):
            url = svc.upload_image(fake_bytes, "photo.jpg", product_id=1)
        assert url.startswith("https://")

    def test_accepts_jpeg_extension(self):
        svc = S3UploadService()
        fake_bytes = b"\xff\xd8\xff" + b"x" * 100
        with patch.object(svc, "_upload_to_s3", return_value="https://cdn.example.com/b.jpg"):
            url = svc.upload_image(fake_bytes, "photo.jpeg", product_id=1)
        assert url.startswith("https://")

    def test_accepts_png_extension(self):
        svc = S3UploadService()
        fake_bytes = b"\x89PNG\r\n\x1a\n" + b"x" * 100  # PNG magic bytes
        with patch.object(svc, "_upload_to_s3", return_value="https://cdn.example.com/c.png"):
            url = svc.upload_image(fake_bytes, "photo.png", product_id=1)
        assert url.startswith("https://")

    def test_s3_key_uses_product_id_and_uuid(self):
        svc = S3UploadService()
        fake_bytes = b"\xff\xd8\xff" + b"x" * 100
        captured = {}

        def fake_upload(key, data, content_type):
            captured["key"] = key
            return f"https://cdn.example.com/{key}"

        with patch.object(svc, "_upload_to_s3", side_effect=fake_upload):
            svc.upload_image(fake_bytes, "photo.jpg", product_id=42)

        assert captured["key"].startswith("products/42/")
        assert captured["key"].endswith(".jpg")

    def test_delete_image_does_not_raise_on_s3_failure(self):
        svc = S3UploadService()
        with patch.object(svc, "_delete_from_s3", side_effect=Exception("S3 down")):
            # Should not raise
            svc.delete_image("products/1/abc.jpg")

    def test_delete_image_by_url_extracts_key(self):
        svc = S3UploadService()
        deleted = {}

        def fake_delete(key):
            deleted["key"] = key

        with patch.object(svc, "_delete_from_s3", side_effect=fake_delete):
            svc.delete_image_by_url("https://cdn.example.com/products/1/abc.jpg")

        assert "products/1/abc.jpg" in deleted["key"]
