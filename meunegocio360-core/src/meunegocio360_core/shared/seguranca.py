"""Segurança transversal: cabeçalhos (RNF-BE-41), negação por padrão (RNF-021, RNF-BE-40)
e identidade do usuário autenticado.

O equivalente ao ``SecurityFilterChain`` está em ``ExigirAutenticacaoMiddleware``: ele roda
ANTES do roteamento, então qualquer caminho fora da lista pública, exista ou não, exige token
(um caminho desconhecido sem token recebe 401, e não 404).
"""

import json
import uuid
from collections.abc import Iterable
from dataclasses import dataclass
from typing import Protocol

from starlette.datastructures import Headers, MutableHeaders
from starlette.types import ASGIApp, Message, Receive, Scope, Send


@dataclass(frozen=True)
class Principal:
    """Usuário autenticado pelo token de acesso."""

    usuario_id: uuid.UUID
    perfil: str


class TokenDeAcessoInvalidoError(Exception):
    """Token ausente, malformado, expirado, adulterado ou com algoritmo/emissor inesperado."""


class VerificadorDeToken(Protocol):
    def verificar(self, token: str) -> Principal: ...


# --------------------------------------------------------------------------- cabeçalhos

_CABECALHOS_PADRAO = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "0",
    "Cache-Control": "no-cache, no-store, max-age=0, must-revalidate",
    "Pragma": "no-cache",
    "Expires": "0",
}
_HSTS = ("Strict-Transport-Security", "max-age=31536000; includeSubDomains")


def aplicar_cabecalhos_seguranca(headers: MutableHeaders, *, hsts: bool) -> None:
    for nome, valor in _CABECALHOS_PADRAO.items():
        headers.setdefault(nome, valor)
    if hsts:
        headers.setdefault(*_HSTS)


class CabecalhosSegurancaMiddleware:
    def __init__(self, app: ASGIApp, *, hsts: bool) -> None:
        self.app = app
        self.hsts = hsts

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        async def enviar(message: Message) -> None:
            if message["type"] == "http.response.start":
                aplicar_cabecalhos_seguranca(MutableHeaders(scope=message), hsts=self.hsts)
            await send(message)

        await self.app(scope, receive, enviar)


# --------------------------------------------------------------------------- negação por padrão


@dataclass(frozen=True)
class RotaPublica:
    metodo: str
    caminho: str


class ExigirAutenticacaoMiddleware:
    """Deny-by-default: só as rotas listadas são públicas; as demais exigem Bearer válido."""

    def __init__(
        self, app: ASGIApp, *, verificador: VerificadorDeToken, publicas: Iterable[RotaPublica]
    ) -> None:
        self.app = app
        self.verificador = verificador
        self.publicas = {(r.metodo.upper(), r.caminho) for r in publicas}

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http" or (scope["method"], scope["path"]) in self.publicas:
            await self.app(scope, receive, send)
            return

        autorizacao = Headers(scope=scope).get("authorization", "")
        esquema, _, token = autorizacao.partition(" ")
        try:
            if esquema.lower() != "bearer" or not token.strip():
                raise TokenDeAcessoInvalidoError
            principal = self.verificador.verificar(token.strip())
        except TokenDeAcessoInvalidoError:
            await _responder_nao_autenticado(scope, send, token_informado=bool(autorizacao))
            return

        scope.setdefault("state", {})["principal"] = principal
        await self.app(scope, receive, send)


async def _responder_nao_autenticado(scope: Scope, send: Send, *, token_informado: bool) -> None:
    # Montado aqui (e não pelo tratador de exceções) porque o middleware roda antes do roteador.
    corpo = {
        "type": "https://meunegocio360.com.br/problemas/nao-autenticado",
        "title": "Não autenticado",
        "status": 401,
        "detail": "Token de acesso ausente, inválido ou expirado.",
        "instance": scope["path"],
        "code": "UNAUTHORIZED",
        "traceId": scope.get("state", {}).get("request_id"),
    }
    desafio = 'Bearer error="invalid_token"' if token_informado else "Bearer"
    dados = json.dumps(corpo, ensure_ascii=False).encode("utf-8")
    await send(
        {
            "type": "http.response.start",
            "status": 401,
            "headers": [
                (b"content-type", b"application/problem+json"),
                (b"content-length", str(len(dados)).encode()),
                (b"www-authenticate", desafio.encode()),
            ],
        }
    )
    await send({"type": "http.response.body", "body": dados})
