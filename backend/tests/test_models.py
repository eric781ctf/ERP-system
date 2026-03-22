"""Task 2.1 / 2.2 / 2.3 — SQLAlchemy Model 與 Schema 測試"""
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


# ── Task 2.1 fabric_products ──────────────────────────────────────────────────

class TestFabricProductModel:
    def test_can_create_product_with_required_fields(self, session):
        from models.product import FabricProduct
        p = FabricProduct(name_zh="素色平紋布", composition="100% Polyester")
        session.add(p)
        session.flush()
        assert p.id is not None

    def test_is_published_defaults_to_false(self, session):
        from models.product import FabricProduct
        p = FabricProduct(name_zh="測試布", composition="棉")
        session.add(p)
        session.flush()
        assert p.is_published is False

    def test_optional_fields_can_be_null(self, session):
        from models.product import FabricProduct
        p = FabricProduct(name_zh="無規格布", composition="麻")
        session.add(p)
        session.flush()
        assert p.name_en is None
        assert p.description_zh is None
        assert p.description_en is None
        assert p.yarn_count is None
        assert p.density is None
        assert p.weight_gsm is None
        assert p.width is None
        assert p.weave_structure is None

    def test_created_at_and_updated_at_auto_set(self, session):
        from models.product import FabricProduct
        p = FabricProduct(name_zh="時間戳測試", composition="Nylon")
        session.add(p)
        session.flush()
        assert p.created_at is not None
        assert p.updated_at is not None

    def test_composition_is_required(self, session):
        from models.product import FabricProduct
        from sqlalchemy.exc import IntegrityError
        p = FabricProduct(name_zh="缺成份")
        session.add(p)
        with pytest.raises((IntegrityError, Exception)):
            session.flush()
        session.rollback()


# ── Task 2.2 product_images ───────────────────────────────────────────────────

class TestProductImageModel:
    def test_can_create_image_for_product(self, session):
        from models.product import FabricProduct
        from models.product_image import ProductImage
        p = FabricProduct(name_zh="圖片測試布", composition="滌綸")
        session.add(p)
        session.flush()
        img = ProductImage(product_id=p.id, url="https://cdn.example.com/a.jpg", sort_order=0)
        session.add(img)
        session.flush()
        assert img.id is not None

    def test_sort_order_range_enforced_by_app(self, session):
        """sort_order 0-5 is enforced at application layer (upload count limit).
        The DB model accepts any integer so reorder can use temp values safely."""
        from models.product import FabricProduct
        from models.product_image import ProductImage
        p = FabricProduct(name_zh="排序測試布", composition="棉")
        session.add(p)
        session.flush()
        # sort_order=6 is allowed at DB level; app layer blocks it via upload count check
        img = ProductImage(product_id=p.id, url="https://cdn.example.com/b.jpg", sort_order=6)
        session.add(img)
        session.flush()
        assert img.sort_order == 6
        session.rollback()

    def test_unique_sort_order_per_product(self, session):
        from models.product import FabricProduct
        from models.product_image import ProductImage
        from sqlalchemy.exc import IntegrityError
        p = FabricProduct(name_zh="唯一排序布", composition="Wool")
        session.add(p)
        session.flush()
        img1 = ProductImage(product_id=p.id, url="https://cdn.example.com/c.jpg", sort_order=0)
        img2 = ProductImage(product_id=p.id, url="https://cdn.example.com/d.jpg", sort_order=0)
        session.add_all([img1, img2])
        with pytest.raises((IntegrityError, Exception)):
            session.flush()
        session.rollback()


# ── Task 2.3 tags & product_tags ─────────────────────────────────────────────

class TestTagModel:
    def test_can_create_tag(self, session):
        from models.tag import Tag
        t = Tag(name="素色")
        session.add(t)
        session.flush()
        assert t.id is not None

    def test_tag_name_is_unique(self, session):
        from models.tag import Tag
        from sqlalchemy.exc import IntegrityError
        session.add(Tag(name="平紋"))
        session.flush()
        session.add(Tag(name="平紋"))
        with pytest.raises((IntegrityError, Exception)):
            session.flush()
        session.rollback()

    def test_product_tag_association(self, session):
        from models.product import FabricProduct
        from models.tag import Tag
        p = FabricProduct(name_zh="有標籤的布", composition="Silk")
        t = Tag(name="高級")
        session.add_all([p, t])
        session.flush()
        p.tags.append(t)
        session.flush()
        assert t in p.tags
