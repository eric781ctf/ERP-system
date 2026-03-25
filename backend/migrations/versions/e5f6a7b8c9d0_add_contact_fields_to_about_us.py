"""add contact fields to about_us

Revision ID: e5f6a7b8c9d0
Revises: d4e5f6a7b8c9
Create Date: 2026-03-25 02:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = 'e5f6a7b8c9d0'
down_revision = 'd4e5f6a7b8c9'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('about_us', sa.Column('fax', sa.String(100), nullable=True))
    op.add_column('about_us', sa.Column('address_zh', sa.String(500), nullable=True))
    op.add_column('about_us', sa.Column('address_en', sa.String(500), nullable=True))
    op.add_column('about_us', sa.Column('business_hours_zh', sa.String(200), nullable=True))
    op.add_column('about_us', sa.Column('business_hours_en', sa.String(200), nullable=True))
    op.add_column('about_us', sa.Column('email', sa.String(200), nullable=True))


def downgrade():
    op.drop_column('about_us', 'email')
    op.drop_column('about_us', 'business_hours_en')
    op.drop_column('about_us', 'business_hours_zh')
    op.drop_column('about_us', 'address_en')
    op.drop_column('about_us', 'address_zh')
    op.drop_column('about_us', 'fax')
