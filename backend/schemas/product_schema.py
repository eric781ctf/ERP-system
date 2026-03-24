from marshmallow import Schema, fields, validate, validates, ValidationError, EXCLUDE


class ProductImageSchema(Schema):
    class Meta:
        unknown = EXCLUDE

    id = fields.Int(dump_only=True)
    url = fields.Str(dump_only=True)
    sort_order = fields.Int(dump_only=True)


class ProductSummarySchema(Schema):
    class Meta:
        unknown = EXCLUDE

    id = fields.Int(dump_only=True)
    name_zh = fields.Str(dump_only=True)
    name_en = fields.Str(dump_only=True, allow_none=True)
    composition = fields.Str(dump_only=True)
    weave_structure = fields.Str(dump_only=True, allow_none=True)
    is_published = fields.Bool(dump_only=True)
    updated_at = fields.DateTime(dump_only=True, format="iso")
    cover_image_url = fields.Method("get_cover_image_url")
    tags = fields.Method("get_tag_names")

    def get_cover_image_url(self, obj):
        for img in (obj.images or []):
            if img.sort_order == 0:
                return img.url
        return None

    def get_tag_names(self, obj):
        return [t.name for t in (obj.tags or [])]


class ProductDetailSchema(ProductSummarySchema):
    description_zh = fields.Str(dump_only=True, allow_none=True)
    description_en = fields.Str(dump_only=True, allow_none=True)
    yarn_count = fields.Str(dump_only=True, allow_none=True)
    density = fields.Str(dump_only=True, allow_none=True)
    weight_gsm = fields.Int(dump_only=True, allow_none=True)
    width = fields.Str(dump_only=True, allow_none=True)
    weave_structure = fields.Str(dump_only=True, allow_none=True)
    images = fields.List(fields.Nested(ProductImageSchema), dump_only=True)


class CreateProductSchema(Schema):
    class Meta:
        unknown = EXCLUDE

    name_zh = fields.Str(required=True)
    composition = fields.Str(required=True)
    name_en = fields.Str(load_default=None)
    description_zh = fields.Str(load_default=None)
    description_en = fields.Str(load_default=None)
    yarn_count = fields.Str(load_default=None)
    density = fields.Str(load_default=None)
    weight_gsm = fields.Int(load_default=None)
    width = fields.Str(load_default=None)
    weave_structure = fields.Str(load_default=None)
    tags = fields.List(fields.Str(), load_default=[])

    @validates("composition")
    def validate_composition(self, value, **kwargs):
        if not value or not value.strip():
            raise ValidationError("composition 為必填欄位")


class UpdateProductSchema(CreateProductSchema):
    name_zh = fields.Str(load_default=None)
    composition = fields.Str(load_default=None)

    @validates("composition")
    def validate_composition(self, value, **kwargs):
        if value is not None and not value.strip():
            raise ValidationError("composition 不得為空")
