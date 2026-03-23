"""seed default admin user

Revision ID: a1b2c3d4e5f6
Revises: 0b54fe5507fd
Create Date: 2026-03-23 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import table, column
import bcrypt
import datetime

# revision identifiers, used by Alembic.
revision = 'a1b2c3d4e5f6'
down_revision = '0b54fe5507fd'
branch_labels = None
depends_on = None

ADMIN_USERNAME = 'admin'
ADMIN_PASSWORD = '570429Eric'


def upgrade():
    users_table = table(
        'users',
        column('username', sa.String),
        column('password_hash', sa.String),
        column('is_active', sa.Boolean),
        column('created_at', sa.DateTime),
    )

    conn = op.get_bind()
    result = conn.execute(
        sa.text("SELECT COUNT(*) FROM users WHERE username = :u"),
        {"u": ADMIN_USERNAME}
    ).scalar()

    if result == 0:
        password_hash = bcrypt.hashpw(
            ADMIN_PASSWORD.encode('utf-8'),
            bcrypt.gensalt(12)
        ).decode('utf-8')

        op.bulk_insert(users_table, [{
            'username': ADMIN_USERNAME,
            'password_hash': password_hash,
            'is_active': True,
            'created_at': datetime.datetime.utcnow(),
        }])


def downgrade():
    op.execute(
        sa.text("DELETE FROM users WHERE username = :u"),
        {"u": ADMIN_USERNAME}
    )
