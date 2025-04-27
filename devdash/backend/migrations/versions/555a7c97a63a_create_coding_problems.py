"""create_coding_problems

Revision ID: 555a7c97a63a
Revises: 198a1c6d8478
Create Date: 2025-04-27 01:16:54.672281

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '555a7c97a63a'
down_revision: Union[str, None] = '198a1c6d8478'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('coding_problems',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('slug', sa.String(), nullable=False),
        sa.Column('difficulty', sa.Text(), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('example_cases', sa.JSON(), nullable=False),
        sa.Column('test_cases', sa.JSON(), nullable=False),
        sa.Column('starter_code', sa.JSON(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('slug')
    )


def downgrade() -> None:
    pass
