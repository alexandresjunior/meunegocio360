"""Montagem dos casos de uso por requisição, com injeção por construtor (RNF-BE-03).

Os serviços sem estado (relógio, bcrypt, JWT...) são criados uma vez em ``auth/modulo.py`` e
guardados em ``app.state.auth``; aqui só se instanciam os casos de uso com eles.
"""

from dataclasses import dataclass
from typing import Annotated

from fastapi import Depends, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from meunegocio360_core.auth.api.cookies import CookieDeRefresh
from meunegocio360_core.auth.api.problemas import ORIGEM_NAO_PERMITIDA
from meunegocio360_core.auth.application.autenticar import Autenticar
from meunegocio360_core.auth.application.comum import (
    EmissorDeSessao,
    FabricaDeUnidadeDeTrabalho,
    PoliticaDeAutenticacao,
)
from meunegocio360_core.auth.application.encerrar_sessao import EncerrarSessao
from meunegocio360_core.auth.application.obter_usuario_atual import ObterUsuarioAtual
from meunegocio360_core.auth.application.renovar_sessao import RenovarSessao
from meunegocio360_core.auth.domain.erros import SessaoInvalidaError
from meunegocio360_core.auth.domain.portas import CodificadorDeSenha, GeradorDeRefreshToken
from meunegocio360_core.shared.erros import ProblemaHttpError
from meunegocio360_core.shared.relogio import Relogio
from meunegocio360_core.shared.seguranca import Principal


@dataclass(frozen=True)
class ContextoAuth:
    nova_unidade_de_trabalho: FabricaDeUnidadeDeTrabalho
    codificador: CodificadorDeSenha
    gerador_de_refresh: GeradorDeRefreshToken
    emissor_de_sessao: EmissorDeSessao
    politica: PoliticaDeAutenticacao
    relogio: Relogio
    cookie: CookieDeRefresh
    origens_permitidas: frozenset[str]


def _contexto(request: Request) -> ContextoAuth:
    return request.app.state.auth


Contexto = Annotated[ContextoAuth, Depends(_contexto)]


def cookie_de_refresh(ctx: Contexto) -> CookieDeRefresh:
    return ctx.cookie


def autenticar(ctx: Contexto) -> Autenticar:
    return Autenticar(
        ctx.nova_unidade_de_trabalho,
        ctx.codificador,
        ctx.emissor_de_sessao,
        ctx.politica,
        ctx.relogio,
    )


def renovar_sessao(ctx: Contexto) -> RenovarSessao:
    return RenovarSessao(
        ctx.nova_unidade_de_trabalho, ctx.gerador_de_refresh, ctx.emissor_de_sessao, ctx.relogio
    )


def encerrar_sessao(ctx: Contexto) -> EncerrarSessao:
    return EncerrarSessao(ctx.nova_unidade_de_trabalho, ctx.gerador_de_refresh, ctx.relogio)


def obter_usuario_atual(ctx: Contexto) -> ObterUsuarioAtual:
    return ObterUsuarioAtual(ctx.nova_unidade_de_trabalho)


def verificar_origem(request: Request, ctx: Contexto) -> None:
    """RNF-BE-40: endpoints que usam o cookie recusam ``Origin`` fora da lista permitida."""
    origem = request.headers.get("origin")
    if origem is not None and origem.rstrip("/") not in ctx.origens_permitidas:
        raise ProblemaHttpError(ORIGEM_NAO_PERMITIDA)


# Só documenta o esquema Bearer no OpenAPI; a validação do token é feita antes, pelo
# ExigirAutenticacaoMiddleware (negação por padrão).
_esquema_bearer = HTTPBearer(auto_error=False, description="Token de acesso (JWT)")


def usuario_autenticado(
    request: Request,
    _credenciais: Annotated[HTTPAuthorizationCredentials | None, Depends(_esquema_bearer)],
) -> Principal:
    principal = getattr(request.state, "principal", None)
    if principal is None:
        raise SessaoInvalidaError
    return principal
