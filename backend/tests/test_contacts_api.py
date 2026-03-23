"""Task 2 — contacts Blueprint CRUD API 整合測試"""
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
def auth_headers(app):
    """回傳帶有有效 access token 的 headers。"""
    from flask_jwt_extended import create_access_token
    with app.app_context():
        token = create_access_token(identity="1")
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def sample_contacts(app):
    """建立測試用聯絡人資料，回傳 id 清單 {customer_id, supplier_id, null_id}。"""
    from models.contact import Contact
    with app.app_context():
        c1 = Contact(name="Alpha Customer", type="customer", phone="0911000001")
        c2 = Contact(name="Beta Supplier", type="supplier", phone="0911000002")
        c3 = Contact(name="Gamma Unclassified", type=None)
        _db.session.add_all([c1, c2, c3])
        _db.session.commit()
        return {"customer_id": c1.id, "supplier_id": c2.id, "null_id": c3.id}


# ── Task 2.1 GET 列表端點 ──────────────────────────────────────────────────────

class TestGetContacts:
    def test_get_all_returns_all_contacts_including_null_type(
        self, client, auth_headers, sample_contacts
    ):
        res = client.get("/api/v1/contacts", headers=auth_headers)
        assert res.status_code == 200
        data = res.get_json()
        assert data["success"] is True
        assert len(data["data"]) == 3

    def test_get_filter_by_customer_type(
        self, client, auth_headers, sample_contacts
    ):
        res = client.get("/api/v1/contacts?type=customer", headers=auth_headers)
        assert res.status_code == 200
        contacts = res.get_json()["data"]
        assert len(contacts) == 1
        assert contacts[0]["type"] == "customer"

    def test_get_filter_by_supplier_type(
        self, client, auth_headers, sample_contacts
    ):
        res = client.get("/api/v1/contacts?type=supplier", headers=auth_headers)
        assert res.status_code == 200
        contacts = res.get_json()["data"]
        assert len(contacts) == 1
        assert contacts[0]["type"] == "supplier"

    def test_get_search_by_name_ilike(
        self, client, auth_headers, sample_contacts
    ):
        res = client.get("/api/v1/contacts?search=alpha", headers=auth_headers)
        assert res.status_code == 200
        contacts = res.get_json()["data"]
        assert len(contacts) == 1
        assert "Alpha" in contacts[0]["name"]

    def test_get_results_sorted_by_name(
        self, client, auth_headers, sample_contacts
    ):
        res = client.get("/api/v1/contacts", headers=auth_headers)
        names = [c["name"] for c in res.get_json()["data"]]
        assert names == sorted(names)

    def test_get_without_jwt_returns_401(self, client):
        res = client.get("/api/v1/contacts")
        assert res.status_code == 401


# ── Task 2.2 POST 新增端點 ────────────────────────────────────────────────────

class TestCreateContact:
    def test_create_minimal_contact_returns_201(self, client, auth_headers):
        res = client.post(
            "/api/v1/contacts",
            json={"name": "New Customer"},
            headers=auth_headers,
        )
        assert res.status_code == 201
        data = res.get_json()
        assert data["success"] is True
        assert data["data"]["name"] == "New Customer"
        assert "id" in data["data"]

    def test_create_full_contact_with_email_method(self, client, auth_headers):
        payload = {
            "name": "Full Contact",
            "phone": "0911123456",
            "fax": "0223456789",
            "tax_id": "12345678",
            "contact_methods": ["line", "email"],
            "email": "full@example.com",
            "type": "customer",
            "note": "VIP",
        }
        res = client.post("/api/v1/contacts", json=payload, headers=auth_headers)
        assert res.status_code == 201
        d = res.get_json()["data"]
        assert d["email"] == "full@example.com"
        assert "line" in d["contact_methods"]

    def test_create_empty_name_returns_400(self, client, auth_headers):
        res = client.post(
            "/api/v1/contacts",
            json={"name": ""},
            headers=auth_headers,
        )
        assert res.status_code == 400

    def test_create_missing_name_returns_400(self, client, auth_headers):
        res = client.post(
            "/api/v1/contacts",
            json={"phone": "0911000000"},
            headers=auth_headers,
        )
        assert res.status_code == 400

    def test_create_contact_methods_email_without_email_field_returns_400(
        self, client, auth_headers
    ):
        res = client.post(
            "/api/v1/contacts",
            json={"name": "Test", "contact_methods": ["email"]},
            headers=auth_headers,
        )
        assert res.status_code == 400

    def test_create_invalid_type_returns_400(self, client, auth_headers):
        res = client.post(
            "/api/v1/contacts",
            json={"name": "Test", "type": "invalid"},
            headers=auth_headers,
        )
        assert res.status_code == 400

    def test_create_invalid_contact_method_returns_400(self, client, auth_headers):
        res = client.post(
            "/api/v1/contacts",
            json={"name": "Test", "contact_methods": ["telegram"]},
            headers=auth_headers,
        )
        assert res.status_code == 400

    def test_create_without_jwt_returns_401(self, client):
        res = client.post("/api/v1/contacts", json={"name": "Test"})
        assert res.status_code == 401


# ── Task 2.3 PUT 更新端點 ─────────────────────────────────────────────────────

class TestUpdateContact:
    def test_update_name_returns_200_with_updated_data(
        self, client, auth_headers, sample_contacts
    ):
        cid = sample_contacts["customer_id"]
        res = client.put(
            f"/api/v1/contacts/{cid}",
            json={"name": "Updated Name"},
            headers=auth_headers,
        )
        assert res.status_code == 200
        data = res.get_json()
        assert data["success"] is True
        assert data["data"]["name"] == "Updated Name"

    def test_update_nonexistent_id_returns_404(self, client, auth_headers):
        res = client.put(
            "/api/v1/contacts/99999",
            json={"name": "x"},
            headers=auth_headers,
        )
        assert res.status_code == 404

    def test_update_partial_fields_preserved(
        self, client, auth_headers, sample_contacts
    ):
        cid = sample_contacts["customer_id"]
        res = client.put(
            f"/api/v1/contacts/{cid}",
            json={"phone": "0922999999"},
            headers=auth_headers,
        )
        assert res.status_code == 200
        d = res.get_json()["data"]
        assert d["phone"] == "0922999999"
        assert d["name"] == "Alpha Customer"

    def test_update_without_jwt_returns_401(self, client, sample_contacts):
        cid = sample_contacts["customer_id"]
        res = client.put(f"/api/v1/contacts/{cid}", json={"name": "x"})
        assert res.status_code == 401


# ── Task 2.4 DELETE 刪除端點 ──────────────────────────────────────────────────

class TestDeleteContact:
    def test_delete_existing_contact_returns_200(
        self, client, auth_headers, sample_contacts
    ):
        cid = sample_contacts["customer_id"]
        res = client.delete(f"/api/v1/contacts/{cid}", headers=auth_headers)
        assert res.status_code == 200
        assert res.get_json()["success"] is True

    def test_delete_nonexistent_id_returns_404(self, client, auth_headers):
        res = client.delete("/api/v1/contacts/99999", headers=auth_headers)
        assert res.status_code == 404

    def test_delete_without_jwt_returns_401(self, client, sample_contacts):
        cid = sample_contacts["customer_id"]
        res = client.delete(f"/api/v1/contacts/{cid}")
        assert res.status_code == 401

    def test_delete_actually_removes_from_db(
        self, client, auth_headers, sample_contacts, app
    ):
        cid = sample_contacts["customer_id"]
        client.delete(f"/api/v1/contacts/{cid}", headers=auth_headers)
        res = client.get("/api/v1/contacts", headers=auth_headers)
        ids = [c["id"] for c in res.get_json()["data"]]
        assert cid not in ids
