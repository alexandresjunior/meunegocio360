"""Logs: texto em dev; JSON estruturado em test e prod (RNF-050, RNF-BE-44)."""

import json
import logging
import sys
from datetime import UTC, datetime

from meunegocio360_core.shared.correlacao import request_id_atual


class _FiltroCorrelacao(logging.Filter):
    def filter(self, record: logging.LogRecord) -> bool:
        record.request_id = request_id_atual.get() or "-"
        return True


class _FormatoJson(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        evento = {
            "timestamp": datetime.fromtimestamp(record.created, UTC).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "requestId": getattr(record, "request_id", "-"),
        }
        if record.exc_info:
            evento["exception"] = self.formatException(record.exc_info)
        return json.dumps(evento, ensure_ascii=False)


def configurar_logs(estruturado: bool) -> None:
    handler = logging.StreamHandler(sys.stdout)
    handler.addFilter(_FiltroCorrelacao())
    if estruturado:
        handler.setFormatter(_FormatoJson())
    else:
        handler.setFormatter(
            logging.Formatter("%(asctime)s %(levelname)-5s [%(request_id)s] %(name)s: %(message)s")
        )
    raiz = logging.getLogger()
    raiz.handlers = [handler]
    raiz.setLevel(logging.INFO)
    # Os logs do uvicorn passam pelo mesmo formato; o log de acesso dele (com IP) é desligado,
    # pois o CorrelacaoMiddleware já registra cada requisição sem dados pessoais (RNF-025).
    for nome in ("uvicorn", "uvicorn.error"):
        logging.getLogger(nome).handlers = []
        logging.getLogger(nome).propagate = True
    logging.getLogger("uvicorn.access").disabled = True


def mascarar_email(email: str) -> str:
    """``fulano@empresa.com`` -> ``f***@empresa.com``: nunca registrar o e-mail completo."""
    usuario, separador, dominio = email.partition("@")
    if not separador:
        return "***"
    return f"{usuario[:1]}***@{dominio}"
