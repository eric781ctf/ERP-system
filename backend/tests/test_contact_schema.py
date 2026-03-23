"""Task 3.1 — ContactSchema 單元測試"""
import pytest
from marshmallow import ValidationError
from schemas.contact_schema import ContactSchema


class TestContactSchema:
    def test_valid_full_data_passes(self):
        data = {
            "name": "測試公司",
            "phone": "02-1234-5678",
            "fax": "02-8765-4321",
            "tax_id": "12345678",
            "contact_methods": ["line", "email"],
            "email": "test@example.com",
            "type": "customer",
            "note": "備注",
        }
        result = ContactSchema().load(data)
        assert result["name"] == "測試公司"
        assert result["email"] == "test@example.com"
        assert result["type"] == "customer"

    def test_only_name_required(self):
        result = ContactSchema().load({"name": "最小欄位"})
        assert result["name"] == "最小欄位"
        assert result["phone"] is None
        assert result["type"] is None

    def test_name_empty_string_raises_validation_error(self):
        with pytest.raises(ValidationError) as exc:
            ContactSchema().load({"name": ""})
        assert "name" in exc.value.messages

    def test_invalid_type_raises_validation_error(self):
        with pytest.raises(ValidationError) as exc:
            ContactSchema().load({"name": "測試", "type": "unknown_type"})
        assert "type" in exc.value.messages

    def test_null_type_passes(self):
        result = ContactSchema().load({"name": "測試", "type": None})
        assert result["type"] is None

    def test_supplier_type_passes(self):
        result = ContactSchema().load({"name": "供應商", "type": "supplier"})
        assert result["type"] == "supplier"

    def test_invalid_contact_method_raises_validation_error(self):
        with pytest.raises(ValidationError) as exc:
            ContactSchema().load({"name": "測試", "contact_methods": ["telegram"]})
        assert "contact_methods" in exc.value.messages

    def test_valid_contact_methods_pass(self):
        result = ContactSchema().load({
            "name": "測試",
            "contact_methods": ["line", "whatsapp", "wechat", "email"],
            "email": "test@example.com",
        })
        assert result["contact_methods"] == ["line", "whatsapp", "wechat", "email"]

    def test_cross_field_email_required_when_contact_methods_contains_email(self):
        with pytest.raises(ValidationError) as exc:
            ContactSchema().load({
                "name": "測試",
                "contact_methods": ["email"],
                "email": None,
            })
        assert "email" in exc.value.messages

    def test_cross_field_email_required_when_email_missing(self):
        with pytest.raises(ValidationError) as exc:
            ContactSchema().load({
                "name": "測試",
                "contact_methods": ["line", "email"],
            })
        assert "email" in exc.value.messages

    def test_cross_field_email_not_required_without_email_method(self):
        result = ContactSchema().load({
            "name": "測試",
            "contact_methods": ["line"],
            "email": None,
        })
        assert result["email"] is None

    def test_cross_field_email_with_value_passes(self):
        result = ContactSchema().load({
            "name": "測試",
            "contact_methods": ["email"],
            "email": "valid@example.com",
        })
        assert result["email"] == "valid@example.com"
