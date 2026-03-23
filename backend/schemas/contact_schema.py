from marshmallow import Schema, fields, validate, validates_schema, ValidationError


class ContactSchema(Schema):
    id = fields.Int(dump_only=True)
    name = fields.Str(required=True, validate=validate.Length(min=1))
    phone = fields.Str(load_default=None, allow_none=True)
    fax = fields.Str(load_default=None, allow_none=True)
    tax_id = fields.Str(load_default=None, allow_none=True)
    contact_methods = fields.List(
        fields.Str(validate=validate.OneOf(["line", "whatsapp", "wechat", "email"])),
        load_default=None,
        allow_none=True,
    )
    email = fields.Email(load_default=None, allow_none=True)
    type = fields.Str(
        load_default=None,
        validate=validate.OneOf(["customer", "supplier"]),
        allow_none=True,
    )
    note = fields.Str(load_default=None, allow_none=True)
    created_at = fields.DateTime(dump_only=True)

    @validates_schema
    def validate_email_required(self, data, **kwargs):
        methods = data.get("contact_methods") or []
        if "email" in methods and not data.get("email"):
            raise ValidationError(
                {"email": ["contact_methods 含 email 時 email 欄位為必填"]}
            )
