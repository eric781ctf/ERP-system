"""rename description to summary and add content fields

Revision ID: f6a7b8c9d0e1
Revises: e5f6a7b8c9d0
Create Date: 2026-03-29 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = 'f6a7b8c9d0e1'
down_revision = 'e5f6a7b8c9d0'
branch_labels = None
depends_on = None


def upgrade():
    # Rename description_zh -> summary_zh, description_en -> summary_en
    op.alter_column('fabric_products', 'description_zh', new_column_name='summary_zh')
    op.alter_column('fabric_products', 'description_en', new_column_name='summary_en')

    # Add rich text content columns
    op.add_column('fabric_products', sa.Column('content_zh', sa.Text, nullable=True))
    op.add_column('fabric_products', sa.Column('content_en', sa.Text, nullable=True))


def downgrade():
    op.drop_column('fabric_products', 'content_en')
    op.drop_column('fabric_products', 'content_zh')
    op.alter_column('fabric_products', 'summary_en', new_column_name='description_en')
    op.alter_column('fabric_products', 'summary_zh', new_column_name='description_zh')
