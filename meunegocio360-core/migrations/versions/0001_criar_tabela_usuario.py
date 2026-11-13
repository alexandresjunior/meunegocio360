"""Criar tabela usuario (RF-BE-001).

Revisão: 0001
Anterior:

Migrations aplicadas NUNCA são editadas (RNF-BE-20): crie uma nova revisão.
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0001"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    instante = sa.TIMESTAMP(timezone=True)
    op.create_table(
        "usuario",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("nome", sa.String(120), nullable=False),
        sa.Column("email", sa.String(160), nullable=False),
        sa.Column("senha_hash", sa.String(100), nullable=False),
        sa.Column("perfil", sa.String(20), nullable=False),
        sa.Column("ativo", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("tentativas_falhas", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("bloqueado_ate", instante, nullable=True),
        sa.Column("ultimo_login_em", instante, nullable=True),
        sa.Column("criado_em", instante, nullable=False),
        sa.Column("atualizado_em", instante, nullable=False),
        sa.Column("versao", sa.BigInteger(), nullable=False),
        sa.PrimaryKeyConstraint("id", name="pk_usuario"),
        sa.UniqueConstraint("email", name="uq_usuario_email"),
        sa.CheckConstraint("perfil IN ('ADMIN', 'USUARIO')", name="ck_usuario_perfil_valido"),
        sa.CheckConstraint("tentativas_falhas >= 0", name="ck_usuario_tentativas_nao_negativas"),
    )


def downgrade() -> None:
    op.drop_table("usuario")
