import os
import uuid
import logging
from urllib.parse import urlparse

logger = logging.getLogger(__name__)

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png"}
ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png"}
MAX_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB


class ValidationError(Exception):
    pass


class S3UploadService:
    def __init__(self):
        self._bucket = os.environ.get("AWS_S3_BUCKET", "")
        self._region = os.environ.get("AWS_S3_REGION", "ap-northeast-1")
        self._cloudfront = os.environ.get("CLOUDFRONT_DOMAIN", "")

    # ── Public interface ──────────────────────────────────────────────────────

    def upload_image(self, file_bytes: bytes, filename: str, product_id: int) -> str:
        """Validate, upload to S3, return public URL. Raises ValidationError on bad input."""
        self._validate_extension(filename)
        self._validate_size(file_bytes)

        ext = os.path.splitext(filename)[1].lower()
        key = f"products/{product_id}/{uuid.uuid4().hex}{ext}"
        content_type = "image/jpeg" if ext in (".jpg", ".jpeg") else "image/png"

        return self._upload_to_s3(key, file_bytes, content_type)

    def delete_image(self, s3_key: str) -> None:
        """Delete from S3. Logs errors, never raises."""
        try:
            self._delete_from_s3(s3_key)
        except Exception as exc:
            logger.error("S3 delete failed for key %s: %s", s3_key, exc)

    def delete_image_by_url(self, url: str) -> None:
        """Extract S3 key from URL and delete. Logs errors, never raises."""
        try:
            key = self._key_from_url(url)
            self._delete_from_s3(key)
        except Exception as exc:
            logger.error("S3 delete failed for url %s: %s", url, exc)

    # ── Private helpers ───────────────────────────────────────────────────────

    def _validate_extension(self, filename: str) -> None:
        ext = os.path.splitext(filename)[1].lower()
        if ext not in ALLOWED_EXTENSIONS:
            raise ValidationError("僅接受 JPG 或 PNG 格式（不接受 WebP 或其他格式）")

    def _validate_size(self, file_bytes: bytes) -> None:
        if len(file_bytes) > MAX_SIZE_BYTES:
            raise ValidationError("圖片大小不得超過 5MB")

    def _key_from_url(self, url: str) -> str:
        parsed = urlparse(url)
        # strip leading slash
        return parsed.path.lstrip("/")

    def _upload_to_s3(self, key: str, data: bytes, content_type: str) -> str:
        """Upload bytes to S3 and return the public URL."""
        import boto3
        s3 = boto3.client("s3", region_name=self._region)
        s3.put_object(
            Bucket=self._bucket,
            Key=key,
            Body=data,
            ContentType=content_type,
        )
        if self._cloudfront:
            return f"{self._cloudfront.rstrip('/')}/{key}"
        return f"https://{self._bucket}.s3.{self._region}.amazonaws.com/{key}"

    def _delete_from_s3(self, key: str) -> None:
        import boto3
        s3 = boto3.client("s3", region_name=self._region)
        s3.delete_object(Bucket=self._bucket, Key=key)
