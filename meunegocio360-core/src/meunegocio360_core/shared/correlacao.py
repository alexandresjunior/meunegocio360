"""Identificador de correlação ``X-Request-Id`` (RNF-050, RNF-BE-43)."""

import logging
import re
import time
import uuid
from contextvars import ContextVar

from starlette.datastructures import MutableHeaders
from starlette.types import ASGIApp, Message, Receive, Scope, Send

CABECALHO = "X-Request-Id"
_FORMATO_VALIDO = re.compile(r"^[A-Za-z0-9._-]{1,64}$")

request_id_atual: ContextVar[str | None] = ContextVar("request_id", default=None)

_log = logging.getLogger("meunegocio360.http")


def _obter_ou_gerar(scope: Scope) -> str:
    for nome, valor in scope.get("headers", []):
        if nome == b"x-request-id":
            recebido = valor.decode("latin-1")
            # Valores recebidos são reaproveitados só se forem seguros para logs e cabeçalhos.
            if _FORMATO_VALIDO.match(recebido):
                return recebido
    return str(uuid.uuid4())


class CorrelacaoMiddleware:
    """Lê ou gera o X-Request-Id, publica-o nos logs e devolve-o na resposta."""

    def __init__(self, app: ASGIApp) -> None:
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        request_id = _obter_ou_gerar(scope)
        scope.setdefault("state", {})["request_id"] = request_id
        token = request_id_atual.set(request_id)
        inicio = time.perf_counter()
        status = 500

        async def enviar(message: Message) -> None:
            nonlocal status
            if message["type"] == "http.response.start":
                status = message["status"]
                MutableHeaders(scope=message)[CABECALHO] = request_id
            await send(message)

        try:
            await self.app(scope, receive, enviar)
        finally:
            # Sem IP nem query string: apenas o necessário para operação (RNF-025).
            _log.info(
                "%s %s -> %s (%.0f ms)",
                scope["method"],
                scope["path"],
                status,
                (time.perf_counter() - inicio) * 1000,
            )
            request_id_atual.reset(token)
