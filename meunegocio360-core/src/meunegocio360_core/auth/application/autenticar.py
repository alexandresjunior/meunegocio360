"""Caso de uso: login por e-mail e senha (RF-BE-001, RN-01 a RN-06, RN-12, RN-13)."""

import logging
import uuid

from meunegocio360_core.auth.application.comum import (
    EmissorDeSessao,
    FabricaDeUnidadeDeTrabalho,
    PoliticaDeAutenticacao,
    SessaoIniciada,
)
from meunegocio360_core.auth.domain.erros import (
    ContaTemporariamenteBloqueadaError,
    CredenciaisInvalidasError,
)
from meunegocio360_core.auth.domain.portas import CodificadorDeSenha
from meunegocio360_core.auth.domain.usuario import Usuario
from meunegocio360_core.shared.logs import mascarar_email
from meunegocio360_core.shared.relogio import Relogio

_log = logging.getLogger("meunegocio360.seguranca")


class Autenticar:
    def __init__(
        self,
        nova_unidade_de_trabalho: FabricaDeUnidadeDeTrabalho,
        codificador: CodificadorDeSenha,
        emissor_de_sessao: EmissorDeSessao,
        politica: PoliticaDeAutenticacao,
        relogio: Relogio,
    ) -> None:
        self._nova_uow = nova_unidade_de_trabalho
        self._codificador = codificador
        self._emissor_de_sessao = emissor_de_sessao
        self._politica = politica
        self._relogio = relogio

    def executar(self, email: str, senha: str) -> SessaoIniciada:
        agora = self._relogio.agora()
        email = Usuario.normalizar_email(email)

        with self._nova_uow() as uow:
            usuario = uow.usuarios.buscar_por_email_para_atualizacao(email)

            if usuario is None:
                # RN-03: mesmo custo de tempo e mesma resposta da senha incorreta.
                self._codificador.simular_verificacao(senha)
                _log.info("Login recusado: e-mail não cadastrado (%s)", mascarar_email(email))
                raise CredenciaisInvalidasError

            if usuario.esta_bloqueado(agora):
                _log.info("Login recusado: conta bloqueada (usuario_id=%s)", usuario.id)
                raise ContaTemporariamenteBloqueadaError(usuario.segundos_ate_desbloqueio(agora))

            # A senha é sempre conferida (tempo de resposta uniforme), mas um usuário inativo
            # não acumula falhas nem é bloqueado: assim ele recebe o mesmo 401 de um e-mail
            # inexistente e nunca um 429 que revelaria a conta (RN-03).
            senha_confere = self._codificador.confere(senha, usuario.senha_hash)

            if not usuario.ativo:
                _log.info("Login recusado: usuário inativo (usuario_id=%s)", usuario.id)
                raise CredenciaisInvalidasError

            if not senha_confere:
                bloqueou = usuario.registrar_falha_de_login(
                    agora,
                    max_tentativas=self._politica.max_tentativas,
                    duracao_bloqueio=self._politica.duracao_bloqueio,
                )
                if bloqueou:
                    # RN-13: o bloqueio encerra as sessões ativas do usuário.
                    uow.refresh_tokens.revogar_sessoes_do_usuario(usuario.id, agora)
                uow.commit()
                if bloqueou:
                    _log.warning("Conta bloqueada por tentativas (usuario_id=%s)", usuario.id)
                else:
                    _log.info("Login recusado: senha incorreta (usuario_id=%s)", usuario.id)
                raise CredenciaisInvalidasError

            usuario.registrar_login(agora)
            sessao = self._emissor_de_sessao.emitir(uow, usuario, uuid.uuid4(), agora)
            uow.commit()

        _log.info("Login realizado (usuario_id=%s)", usuario.id)
        return sessao
