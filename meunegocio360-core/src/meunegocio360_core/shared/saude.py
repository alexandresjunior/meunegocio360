"""Health check público e sem detalhes (RNF-051, RNF-104), no caminho usado pelo Render."""

import logging

from fastapi import APIRouter, Request
from sqlalchemy import text
from starlette.responses import JSONResponse

CAMINHO = "/actuator/health"

_log = logging.getLogger("meunegocio360.saude")

router = APIRouter(tags=["Saúde"])


@router.get(CAMINHO, summary="Health check (UP/DOWN, sem detalhes)")
def saude(request: Request) -> JSONResponse:
    try:
        with request.app.state.fabrica_de_sessoes() as sessao:
            sessao.execute(text("SELECT 1"))
    except Exception:
        _log.warning("Banco de dados indisponível no health check", exc_info=True)
        return JSONResponse({"status": "DOWN"}, status_code=503)
    return JSONResponse({"status": "UP"})
