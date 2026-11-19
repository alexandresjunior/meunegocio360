"""Tipos compartilhados pelos casos de uso de autenticação."""

import uuid
from collections.abc import Callable
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from types import TracebackType
from typing import Protocol, Self

from meunegocio360_core.auth.domain.portas import (
    EmissorDeTokenDeAcesso,
    GeradorDeRefreshToken,
    RepositorioDeRefreshTokens,
    RepositorioDeUsuarios,
)
from meunegocio360_core.auth.domain.refresh_token import RefreshToken
from meunegocio360_core.auth.domain.usuario import Usuario


class UnidadeDeTrabalho(Protocol):
    """Fronteira transacional (equivalente ao ``@Transactional``, RNF-BE-04).

    Tudo o que não for confirmado com ``commit()`` é desfeito ao sair do bloco ``with``.
    """

    usuarios: RepositorioDeUsuarios
    refresh_tokens: RepositorioDeRefreshTokens

    def __enter__(self) -> Self: ...

    def __exit__(
        self,
        tipo: type[BaseException] | None,
        erro: BaseException | None,
        rastro: TracebackType | None,
    ) -> None: ...

    def commit(self) -> None: ...


FabricaDeUnidadeDeTrabalho = Callable[[], UnidadeDeTrabalho]


@dataclass(frozen=True)
class PoliticaDeAutenticacao:
    """Valores configuráveis do RF-BE-001 (``app.auth.*``)."""

    max_tentativas: int
    duracao_bloqueio: timedelta
    validade_refresh: timedelta


@dataclass(frozen=True)
class UsuarioResumo:
    id: uuid.UUID
    nome: str
    email: str
    perfil: str

    @classmethod
    def de(cls, usuario: Usuario) -> "UsuarioResumo":
        return cls(id=usuario.id, nome=usuario.nome, email=usuario.email, perfil=usuario.perfil)


@dataclass(frozen=True)
class SessaoIniciada:
    access_token: str = field(repr=False)
    expira_em_segundos: int
    usuario: UsuarioResumo
    refresh_token: str = field(repr=False)


class EmissorDeSessao:
    """Emite o par token de acesso + refresh token (login e renovação)."""

    def __init__(
        self,
        emissor_de_acesso: EmissorDeTokenDeAcesso,
        gerador_de_refresh: GeradorDeRefreshToken,
        politica: PoliticaDeAutenticacao,
    ) -> None:
        self._emissor_de_acesso = emissor_de_acesso
        self._gerador_de_refresh = gerador_de_refresh
        self._politica = politica

    def emitir(
        self, uow: UnidadeDeTrabalho, usuario: Usuario, familia_id: uuid.UUID, agora: datetime
    ) -> SessaoIniciada:
        valor = self._gerador_de_refresh.gerar()
        uow.refresh_tokens.adicionar(
            RefreshToken.emitir(
                usuario_id=usuario.id,
                familia_id=familia_id,
                token_hash=self._gerador_de_refresh.calcular_hash(valor),
                agora=agora,
                validade=self._politica.validade_refresh,
            )
        )
        acesso = self._emissor_de_acesso.emitir(usuario, agora)
        return SessaoIniciada(
            access_token=acesso.valor,
            expira_em_segundos=acesso.expira_em_segundos,
            usuario=UsuarioResumo.de(usuario),
            refresh_token=valor,
        )
