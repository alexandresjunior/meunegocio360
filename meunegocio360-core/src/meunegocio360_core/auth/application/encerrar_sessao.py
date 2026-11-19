"""Caso de uso: logout idempotente (RN-10)."""

import logging

from meunegocio360_core.auth.application.comum import FabricaDeUnidadeDeTrabalho
from meunegocio360_core.auth.domain.portas import GeradorDeRefreshToken
from meunegocio360_core.shared.relogio import Relogio

_log = logging.getLogger("meunegocio360.seguranca")


class EncerrarSessao:
    def __init__(
        self,
        nova_unidade_de_trabalho: FabricaDeUnidadeDeTrabalho,
        gerador_de_refresh: GeradorDeRefreshToken,
        relogio: Relogio,
    ) -> None:
        self._nova_uow = nova_unidade_de_trabalho
        self._gerador_de_refresh = gerador_de_refresh
        self._relogio = relogio

    def executar(self, refresh_token: str | None) -> None:
        """Revoga a família do token apresentado. Nunca falha: sem cookie ou token inválido,
        não há nada a revogar."""
        if not refresh_token:
            return
        token_hash = self._gerador_de_refresh.calcular_hash(refresh_token)
        with self._nova_uow() as uow:
            registro = uow.refresh_tokens.buscar_por_hash_para_atualizacao(token_hash)
            if registro is None:
                return
            uow.refresh_tokens.revogar_familia(registro.familia_id, self._relogio.agora())
            uow.commit()
        _log.info("Logout realizado (usuario_id=%s)", registro.usuario_id)
