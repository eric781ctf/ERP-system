"""Task 7.5 — flask create-admin CLI 測試"""
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
def runner(app):
    return app.test_cli_runner()


class TestCreateAdminCLI:
    def test_create_admin_success(self, runner, app):
        result = runner.invoke(args=["create-admin", "--username", "admin1", "--password", "secret123"])

        assert result.exit_code == 0
        assert "建立成功" in result.output

        from models.user import User
        with app.app_context():
            user = _db.session.execute(
                _db.select(User).filter_by(username="admin1")
            ).scalar_one_or_none()
            assert user is not None
            assert user.is_active is True
            assert user.check_password("secret123") is True

    def test_create_admin_password_is_hashed(self, runner, app):
        runner.invoke(args=["create-admin", "--username", "admin2", "--password", "mypassword"])

        from models.user import User
        with app.app_context():
            user = _db.session.execute(
                _db.select(User).filter_by(username="admin2")
            ).scalar_one_or_none()
            assert "mypassword" not in user.password_hash

    def test_create_admin_duplicate_username_prints_error(self, runner, app):
        runner.invoke(args=["create-admin", "--username", "admin3", "--password", "pass1"])
        result = runner.invoke(args=["create-admin", "--username", "admin3", "--password", "pass2"])

        assert result.exit_code == 0
        assert "已存在" in result.output

    def test_create_admin_duplicate_does_not_add_record(self, runner, app):
        runner.invoke(args=["create-admin", "--username", "admin4", "--password", "pass1"])
        runner.invoke(args=["create-admin", "--username", "admin4", "--password", "pass2"])

        from models.user import User
        with app.app_context():
            count = _db.session.execute(
                _db.select(_db.func.count()).select_from(User).filter_by(username="admin4")
            ).scalar()
            assert count == 1
