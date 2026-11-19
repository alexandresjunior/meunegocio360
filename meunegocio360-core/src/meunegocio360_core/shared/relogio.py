"""Relógio injetável: as regras de tempo não chamam ``datetime.now()`` diretamente."""

from datetime import UTC, datetime
from typing import Protocol


class Relogio(Protocol):
    def agora(self) -> datetime:
        """Instante atual em UTC (com fuso)."""
        ...


class RelogioDoSistema:
    def agora(self) -> datetime:
        return datetime.now(UTC)
