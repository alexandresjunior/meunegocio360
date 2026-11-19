"""Caso de uso: renovação de sessão por refresh token rotativo (RN-02, RN-07, RN-08, RN-13)."""

import logging

from meunegocio360_core.auth.application.comum import (
    EmissorDeSessao,
    FabricaDeUnidadeDeTrabalho,
    SessaoIniciada,
)
from meunegocio360_core.auth.domain.erros import RefreshTokenInvalidoError
from meunegocio360_core.auth.domain.portas import GeradorDeRefreshToken
from meunegocio360_core.shared.relogio import Relogio

_log = logging.getLogger("meunegocio360.seguranca")


class RenovarSessao:
    def __init__(
        self,
        nova_unidade_de_trabalho: FabricaDeUnidadeDeTrabalho,
        gerador_de_refresh: GeradorDeRefreshToken,
        emissor_de_sessao: EmissorDeSessao,
        relogio: Relogio,
    ) -> None:
        self._nova_uow = nova_unidade_de_trabalho
        self._gerador_de_refresh = gerador_de_refresh
        self._emissor_de_sessao = emissor_de_sessao
        self._relogio = relogio

    def executar(self, refresh_token: str | None) -> SessaoIniciada:
        if not refresh_token:
            raise RefreshTokenInvalidoError
        agora = self._relogio.agora()
        token_hash = self._gerador_de_refresh.calcular_hash(refresh_token)

        with self._nova_uow() as uow:
            # A linha fica bloqueada até o commit: uma renovação concorrente com o mesmo token
            # espera, encontra o token já revogado e cai na detecção de reuso.
            registro = uow.refresh_tokens.buscar_por_hash_para_atualizacao(token_hash)
            if registro is None:
                raise RefreshTokenInvalidoError

            if registro.esta_revogado:
                # RN-08: token já usado reapareceu; pode ter sido roubado.
                uow.refresh_tokens.revogar_familia(registro.familia_id, agora)
                uow.commit()
                _log.warning(
                    "Reuso de refresh token detectado; família revogada (usuario_id=%s)",
                    registro.usuario_id,
                )
                raise RefreshTokenInvalidoError

            if registro.esta_expirado(agora):
                raise RefreshTokenInvalidoError

            usuario = uow.usuarios.buscar_por_id(registro.usuario_id)
            if usuario is None or not usuario.pode_manter_sessao(agora):
                # RN-02 e RN-13: usuário inativo ou bloqueado não renova sessão.
                uow.refresh_tokens.revogar_familia(registro.familia_id, agora)
                uow.commit()
                raise RefreshTokenInvalidoError

            # RN-07: revoga o token apresentado e emite outro na mesma família.
            registro.revogar(agora)
            sessao = self._emissor_de_sessao.emitir(uow, usuario, registro.familia_id, agora)
            uow.commit()

        return sessao
