from flask import Blueprint

bp = Blueprint("tags", __name__)

from . import routes  # noqa: E402, F401
