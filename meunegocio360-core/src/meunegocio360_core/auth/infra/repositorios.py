"""Repositórios SQLAlchemy e unidade de trabalho da feature auth."""

import uuid
from datetime import datetime
from types import TracebackType
from typing import Self

from sqlalchemy import delete, exists, or_, select, update
from sqlalchemy.orm import Session

from meunegocio360_core.auth.domain.refresh_token import RefreshToken
from meunegocio360_core.auth.domain.usuario import Usuario
from meunegocio360_core.auth.infra.orm import tabela_refresh_token, tabela_usuario
from meunegocio360_core.shared.banco import FabricaDeSessoes


class RepositorioSqlDeUsuarios:
    def __init__(self, sessao: Session) -> None:
        self._sessao = sessao

    def buscar_por_email_para_atualizacao(self, email: str) -> Usuario | None:
        consulta = select(Usuario).where(tabela_usuario.c.email == email).with_for_update()
        return self._sessao.scalars(consulta).one_or_none()

    def buscar_por_id(self, usuario_id: uuid.UUID) -> Usuario | None:
        return self._sessao.get(Usuario, usuario_id)

    def existe_email(self, email: str) -> bool:
        return bool(self._sessao.scalar(select(exists().where(tabela_usuario.c.email == email))))

    def adicionar(self, usuario: Usuario) -> None:
        self._sessao.add(usuario)


class RepositorioSqlDeRefreshTokens:
    def __init__(self, sessao: Session) -> None:
        self._sessao = sessao

    def adicionar(self, token: RefreshToken) -> None:
        self._sessao.add(token)

    def buscar_por_hash_para_atualizacao(self, token_hash: str) -> RefreshToken | None:
        consulta = (
            select(RefreshToken)
            .where(tabela_refresh_token.c.token_hash == token_hash)
            .with_for_update()
        )
        return self._sessao.scalars(consulta).one_or_none()

    def revogar_familia(self, familia_id: uuid.UUID, agora: datetime) -> int:
        return self._revogar_ativos(tabela_refresh_token.c.familia_id == familia_id, agora)

    def revogar_sessoes_do_usuario(self, usuario_id: uuid.UUID, agora: datetime) -> int:
        return self._revogar_ativos(tabela_refresh_token.c.usuario_id == usuario_id, agora)

    def remover_encerrados_antes_de(self, limite: datetime) -> int:
        t = tabela_refresh_token
        resultado = self._sessao.execute(
            delete(t).where(or_(t.c.expira_em < limite, t.c.revogado_em < limite))
        )
        return resultado.rowcount

    def _revogar_ativos(self, criterio, agora: datetime) -> int:
        t = tabela_refresh_token
        resultado = self._sessao.execute(
            update(t)
            .where(criterio, t.c.revogado_em.is_(None))
            .values(revogado_em=agora, atualizado_em=agora, versao=t.c.versao + 1)
        )
        return resultado.rowcount


class UnidadeDeTrabalhoSql:
    """Uma sessão (e transação) por caso de uso; sem commit explícito, tudo é desfeito."""

    usuarios: RepositorioSqlDeUsuarios
    refresh_tokens: RepositorioSqlDeRefreshTokens

    def __init__(self, fabrica_de_sessoes: FabricaDeSessoes) -> None:
        self._fabrica = fabrica_de_sessoes

    def __enter__(self) -> Self:
        self._sessao = self._fabrica()
        self.usuarios = RepositorioSqlDeUsuarios(self._sessao)
        self.refresh_tokens = RepositorioSqlDeRefreshTokens(self._sessao)
        return self

    def __exit__(
        self,
        tipo: type[BaseException] | None,
        erro: BaseException | None,
        rastro: TracebackType | None,
    ) -> None:
        self._sessao.rollback()
        self._sessao.close()

    def commit(self) -> None:
        self._sessao.commit()
