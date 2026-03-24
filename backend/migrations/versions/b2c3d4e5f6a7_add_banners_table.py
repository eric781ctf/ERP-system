"""add banners table

Revision ID: b2c3d4e5f6a7
Revises: a1b2c3d4e5f6
Create Date: 2026-03-24 03:20:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'b2c3d4e5f6a7'
down_revision = 'a1b2c3d4e5f6'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'banners',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('image_url', sa.String(length=500), nullable=False),
        sa.Column('alt_text', sa.String(length=200), nullable=False, server_default=''),
        sa.Column('title', sa.String(length=200), nullable=True),
        sa.Column('description', sa.String(length=500), nullable=True),
        sa.Column('link_url', sa.String(length=500), nullable=True),
        sa.Column('sort_order', sa.SmallInteger(), nullable=False, server_default='0'),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('sort_order', name='uq_banner_sort_order'),
    )
    with op.batch_alter_table('banners', schema=None) as batch_op:
        batch_op.create_index('idx_banners_is_active_sort', ['is_active', 'sort_order'], unique=False)


def downgrade():
    with op.batch_alter_table('banners', schema=None) as batch_op:
        batch_op.drop_index('idx_banners_is_active_sort')
    op.drop_table('banners')
