import os
from flask import Flask, jsonify
from extensions import db, migrate, jwt
from config import config


def create_app(config_name="default"):
    app = Flask(__name__)
    app.config.from_object(config[config_name])

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    import models.tag  # noqa: F401 — register Tag + product_tags table
    import models.product  # noqa: F401 — register FabricProduct
    import models.product_image  # noqa: F401 — register ProductImage

    from blueprints.products import bp as products_bp
    app.register_blueprint(products_bp, url_prefix="/api/v1/products")

    from blueprints.tags import bp as tags_bp
    app.register_blueprint(tags_bp, url_prefix="/api/v1/tags")

    @app.get("/health")
    def health():
        return jsonify({"status": "ok", "version": os.environ.get("APP_VERSION", "dev")}), 200

    return app
