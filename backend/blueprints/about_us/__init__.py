from flask import Blueprint

bp = Blueprint("about_us", __name__)

from . import routes  # noqa: E402, F401
