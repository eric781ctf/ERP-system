import os
from flask import Flask, jsonify
from extensions import db, migrate, jwt, cors
from config import config


def create_app(config_name="default"):
    app = Flask(__name__)
    app.config.from_object(config[config_name])

    allowed_origins = os.environ.get(
        "CORS_ALLOWED_ORIGINS", "http://localhost:5173"
    ).split(",")
    cors.init_app(app, resources={r"/api/*": {"origins": allowed_origins}})

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    import models.tag  # noqa: F401 — register Tag + product_tags table
    import models.product  # noqa: F401 — register FabricProduct
    import models.product_image  # noqa: F401 — register ProductImage
    from models.user import TokenBlocklist  # noqa: F401 — register users + token_blocklist tables
    import models.contact  # noqa: F401 — register Contact table
    import models.banner  # noqa: F401 — register Banner table
    import models.catalog_hero  # noqa: F401 — register CatalogHero table
    import models.about_us  # noqa: F401 — register AboutUs table

    @jwt.token_in_blocklist_loader
    def check_if_token_revoked(jwt_header, jwt_payload):
        jti = jwt_payload["jti"]
        token = db.session.execute(
            db.select(TokenBlocklist).filter_by(jti=jti)
        ).scalar_one_or_none()
        return token is not None

    from blueprints.auth import bp as auth_bp
    app.register_blueprint(auth_bp, url_prefix="/api/v1/auth")

    from blueprints.products import bp as products_bp
    app.register_blueprint(products_bp, url_prefix="/api/v1/products")

    from blueprints.tags import bp as tags_bp
    app.register_blueprint(tags_bp, url_prefix="/api/v1/tags")

    from blueprints.contacts import bp as contacts_bp
    app.register_blueprint(contacts_bp, url_prefix="/api/v1/contacts")

    from blueprints.banners import bp as banners_bp
    app.register_blueprint(banners_bp, url_prefix="/api/v1/banners")

    from blueprints.catalog_hero import bp as catalog_hero_bp
    app.register_blueprint(catalog_hero_bp, url_prefix="/api/v1")

    from blueprints.about_us import bp as about_us_bp
    app.register_blueprint(about_us_bp, url_prefix="/api/v1")

    @app.get("/health")
    def health():
        return jsonify({"status": "ok", "version": os.environ.get("APP_VERSION", "dev")}), 200

    import click
    from models.user import User

    @app.cli.command("create-admin")
    @click.option("--username", required=True, help="管理員帳號")
    @click.option("--password", required=True, help="管理員密碼")
    def create_admin(username, password):
        """建立初始管理員帳號。"""
        existing = db.session.execute(
            db.select(User).filter_by(username=username)
        ).scalar_one_or_none()
        if existing:
            click.echo(f"錯誤：帳號 '{username}' 已存在。")
            return
        user = User(username=username, is_active=True)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
        click.echo(f"管理員帳號 '{username}' 建立成功。")

    return app
