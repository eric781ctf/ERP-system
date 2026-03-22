"""
Task 1.1 / 1.2 — Production Dockerfile 結構測試 & /health 端點測試
"""
import pathlib
import pytest

BACKEND_DIR = pathlib.Path(__file__).parent.parent
DOCKERFILE = BACKEND_DIR / "Dockerfile"
DOCKERIGNORE = BACKEND_DIR / ".dockerignore"


# ── Task 1.1 — Production Dockerfile 結構 ────────────────────────────────────

class TestProductionDockerfile:
    def test_dockerfile_exists(self):
        assert DOCKERFILE.exists(), "Dockerfile should exist at backend/Dockerfile"

    def test_multistage_builder_stage(self):
        content = DOCKERFILE.read_text(encoding="utf-8")
        assert "AS builder" in content, "Dockerfile must have a builder stage"

    def test_multistage_runtime_stage(self):
        content = DOCKERFILE.read_text(encoding="utf-8")
        assert "AS runtime" in content, "Dockerfile must have a runtime stage"

    def test_uses_python312_slim_base(self):
        content = DOCKERFILE.read_text(encoding="utf-8")
        assert "python:3.12-slim" in content

    def test_exposes_port_8080(self):
        content = DOCKERFILE.read_text(encoding="utf-8")
        assert "EXPOSE 8080" in content

    def test_cmd_uses_gunicorn(self):
        content = DOCKERFILE.read_text(encoding="utf-8")
        assert "gunicorn" in content, "CMD must use gunicorn"

    def test_nonroot_user_created(self):
        content = DOCKERFILE.read_text(encoding="utf-8")
        assert "useradd" in content or "adduser" in content, \
            "Dockerfile must create a non-root user"

    def test_user_instruction_present(self):
        content = DOCKERFILE.read_text(encoding="utf-8")
        assert "USER " in content, "Dockerfile must switch to non-root USER"

    def test_installs_libmagic1(self):
        """runtime stage needs libmagic1 for python-magic"""
        content = DOCKERFILE.read_text(encoding="utf-8")
        assert "libmagic1" in content


class TestDockerignore:
    def test_dockerignore_exists(self):
        assert DOCKERIGNORE.exists(), ".dockerignore must exist"

    def test_excludes_pycache(self):
        content = DOCKERIGNORE.read_text(encoding="utf-8")
        assert "__pycache__" in content

    def test_excludes_env_file(self):
        content = DOCKERIGNORE.read_text(encoding="utf-8")
        assert ".env" in content

    def test_excludes_tests_directory(self):
        content = DOCKERIGNORE.read_text(encoding="utf-8")
        assert "tests" in content

    def test_excludes_git_directory(self):
        content = DOCKERIGNORE.read_text(encoding="utf-8")
        assert ".git" in content


# ── Task 1.2 — /health 端點 ───────────────────────────────────────────────────

class TestHealthEndpoint:
    def test_health_returns_200(self, client):
        res = client.get("/health")
        assert res.status_code == 200

    def test_health_returns_json_with_status_ok(self, client):
        res = client.get("/health")
        data = res.get_json()
        assert data["status"] == "ok"

    def test_health_returns_version_field(self, client):
        res = client.get("/health")
        data = res.get_json()
        assert "version" in data

    def test_health_no_jwt_required(self, client):
        """No Authorization header — must not return 401"""
        res = client.get("/health")
        assert res.status_code != 401

    def test_health_version_reflects_app_version_env(self, app, monkeypatch):
        monkeypatch.setenv("APP_VERSION", "commit-abc123")
        with app.test_client() as c:
            res = c.get("/health")
        assert res.get_json()["version"] == "commit-abc123"

    def test_health_version_has_default_when_env_unset(self, app, monkeypatch):
        monkeypatch.delenv("APP_VERSION", raising=False)
        with app.test_client() as c:
            res = c.get("/health")
        data = res.get_json()
        assert data["version"] is not None
