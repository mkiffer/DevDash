"""add desc field to codingproblem3

Revision ID: a4a71094fbd8
Revises: 9dd00bcdfd76
Create Date: 2025-04-26 04:33:41.359490

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a4a71094fbd8'
down_revision: Union[str, None] = '9dd00bcdfd76'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    pass
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    pass
    # ### end Alembic commands ###
