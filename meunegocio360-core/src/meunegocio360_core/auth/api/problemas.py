"""Tradução dos erros de negócio da autenticação para problem+json (tabela "Erros")."""

from meunegocio360_core.auth.api.cookies import CookieDeRefresh
from meunegocio360_core.auth.domain.erros import (
    ContaTemporariamenteBloqueadaError,
    CredenciaisInvalidasError,
    RefreshTokenInvalidoError,
    SessaoInvalidaError,
)
from meunegocio360_core.shared.erros import Problema, registrar_traducao

ORIGEM_NAO_PERMITIDA = Problema(
    403,
    "ORIGIN_NOT_ALLOWED",
    "Origem não permitida",
    "A origem da requisição não é permitida.",
    "origem-nao-permitida",
)


def registrar_traducoes(cookie: CookieDeRefresh) -> None:
    registrar_traducao(
        CredenciaisInvalidasError,
        lambda _: Problema(
            401,
            "INVALID_CREDENTIALS",
            "Credenciais inválidas",
            "E-mail ou senha inválidos.",
            "credenciais-invalidas",
        ),
    )
    registrar_traducao(
        ContaTemporariamenteBloqueadaError,
        lambda erro: Problema(
            429,
            "ACCOUNT_TEMPORARILY_LOCKED",
            "Conta temporariamente bloqueada",
            "Muitas tentativas de login. Tente novamente mais tarde.",
            "conta-bloqueada",
            headers={"Retry-After": str(erro.segundos_restantes)},
        ),
    )
    registrar_traducao(
        RefreshTokenInvalidoError,
        lambda _: Problema(
            401,
            "INVALID_REFRESH_TOKEN",
            "Sessão inválida",
            "A sessão expirou ou é inválida. Entre novamente.",
            "refresh-token-invalido",
            ajustar_resposta=cookie.limpar,
        ),
    )
    registrar_traducao(
        SessaoInvalidaError,
        lambda _: Problema(
            401,
            "UNAUTHORIZED",
            "Não autenticado",
            "Token de acesso ausente, inválido ou expirado.",
            "nao-autenticado",
            headers={"WWW-Authenticate": 'Bearer error="invalid_token"'},
        ),
    )
