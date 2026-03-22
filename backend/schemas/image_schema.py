from marshmallow import Schema, fields, EXCLUDE


class ProductImageSchema(Schema):
    class Meta:
        unknown = EXCLUDE

    id = fields.Int(dump_only=True)
    url = fields.Str(dump_only=True)
    sort_order = fields.Int(dump_only=True)
