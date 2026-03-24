from flask import Blueprint

bp = Blueprint("banners", __name__)

from . import routes  # noqa: F401, E402
