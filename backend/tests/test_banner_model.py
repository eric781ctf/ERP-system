"""Task 1.1 — Banner SQLAlchemy Model 測試"""
import pytest
from app import create_app
from extensions import db as _db


@pytest.fixture(scope="module")
def app():
    app = create_app("testing")
    with app.app_context():
        _db.create_all()
        yield app
        _db.drop_all()


@pytest.fixture
def session(app):
    with app.app_context():
        yield _db.session
        _db.session.rollback()


class TestBannerModel:
    def test_can_create_banner_with_required_fields(self, session):
        from models.banner import Banner
        b = Banner(image_url="https://cdn.example.com/banners/a.jpg")
        session.add(b)
        session.flush()
        assert b.id is not None

    def test_is_active_defaults_to_true(self, session):
        from models.banner import Banner
        b = Banner(image_url="https://cdn.example.com/banners/b.jpg")
        session.add(b)
        session.flush()
        assert b.is_active is True

    def test_alt_text_defaults_to_empty_string(self, session):
        from models.banner import Banner
        b = Banner(image_url="https://cdn.example.com/banners/c.jpg")
        session.add(b)
        session.flush()
        assert b.alt_text == ""

    def test_optional_fields_can_be_null(self, session):
        from models.banner import Banner
        b = Banner(image_url="https://cdn.example.com/banners/d.jpg")
        session.add(b)
        session.flush()
        assert b.title is None
        assert b.description is None
        assert b.link_url is None

    def test_created_at_auto_set(self, session):
        from models.banner import Banner
        b = Banner(image_url="https://cdn.example.com/banners/e.jpg")
        session.add(b)
        session.flush()
        assert b.created_at is not None

    def test_sort_order_unique_constraint(self, session):
        from models.banner import Banner
        from sqlalchemy.exc import IntegrityError
        b1 = Banner(image_url="https://cdn.example.com/banners/f1.jpg", sort_order=99)
        b2 = Banner(image_url="https://cdn.example.com/banners/f2.jpg", sort_order=99)
        session.add_all([b1, b2])
        with pytest.raises((IntegrityError, Exception)):
            session.flush()
        session.rollback()

    def test_can_set_all_optional_fields(self, session):
        from models.banner import Banner
        b = Banner(
            image_url="https://cdn.example.com/banners/g.jpg",
            alt_text="夏季新品",
            title="2026 夏季系列",
            description="探索最新布料",
            link_url="/products",
            sort_order=0,
            is_active=True,
        )
        session.add(b)
        session.flush()
        assert b.title == "2026 夏季系列"
        assert b.description == "探索最新布料"
        assert b.link_url == "/products"
        assert b.alt_text == "夏季新品"
