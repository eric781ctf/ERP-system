"""add about_us table

Revision ID: d4e5f6a7b8c9
Revises: c3d4e5f6a7b8
Create Date: 2026-03-25 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'd4e5f6a7b8c9'
down_revision = 'c3d4e5f6a7b8'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'about_us',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('company_intro_zh', sa.Text(), nullable=True),
        sa.Column('company_intro_en', sa.Text(), nullable=True),
        sa.Column('brand_story_zh', sa.Text(), nullable=True),
        sa.Column('brand_story_en', sa.Text(), nullable=True),
        sa.Column('contact_info_zh', sa.String(length=500), nullable=True),
        sa.Column('contact_info_en', sa.String(length=500), nullable=True),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )


def downgrade():
    op.drop_table('about_us')
