"""Criar tabela refresh_token (RF-BE-001).

Revisão: 0002
Anterior: 0001

Migrations aplicadas NUNCA são editadas (RNF-BE-20): crie uma nova revisão.
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0002"
down_revision: str | None = "0001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    instante = sa.TIMESTAMP(timezone=True)
    op.create_table(
        "refresh_token",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("usuario_id", sa.Uuid(), nullable=False),
        sa.Column("familia_id", sa.Uuid(), nullable=False),
        sa.Column("token_hash", sa.CHAR(64), nullable=False),
        sa.Column("expira_em", instante, nullable=False),
        sa.Column("revogado_em", instante, nullable=True),
        sa.Column("criado_em", instante, nullable=False),
        sa.Column("atualizado_em", instante, nullable=False),
        sa.Column("versao", sa.BigInteger(), nullable=False),
        sa.PrimaryKeyConstraint("id", name="pk_refresh_token"),
        sa.ForeignKeyConstraint(
            ["usuario_id"], ["usuario.id"], name="fk_refresh_token_usuario_id_usuario"
        ),
        sa.UniqueConstraint("token_hash", name="uq_refresh_token_token_hash"),
    )
    op.create_index("ix_refresh_token_usuario_id", "refresh_token", ["usuario_id"])
    op.create_index("ix_refresh_token_familia_id", "refresh_token", ["familia_id"])


def downgrade() -> None:
    op.drop_table("refresh_token")
