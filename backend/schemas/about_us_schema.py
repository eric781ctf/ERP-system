from marshmallow import Schema, fields


class AboutUsSchema(Schema):
    id = fields.Int(dump_only=True)
    company_intro_zh = fields.Str(load_default="", allow_none=False)
    company_intro_en = fields.Str(load_default="", allow_none=False)
    brand_story_zh = fields.Str(load_default="", allow_none=False)
    brand_story_en = fields.Str(load_default="", allow_none=False)
    contact_info_zh = fields.Str(load_default="", allow_none=False)
    contact_info_en = fields.Str(load_default="", allow_none=False)
    updated_at = fields.DateTime(dump_only=True)
