"""Rotinas de manutenção: limpeza de refresh tokens e seed de desenvolvimento."""

import logging
import uuid
from dataclasses import dataclass, field
from datetime import timedelta

from meunegocio360_core.auth.application.comum import FabricaDeUnidadeDeTrabalho
from meunegocio360_core.auth.domain.portas import CodificadorDeSenha
from meunegocio360_core.auth.domain.usuario import Perfil, Usuario
from meunegocio360_core.shared.relogio import Relogio

_log = logging.getLogger("meunegocio360.auth")

RETENCAO_TOKENS_ENCERRADOS = timedelta(days=30)


class LimparRefreshTokens:
    """Remove tokens expirados ou revogados há mais de 30 dias (RF-BE-001, Modelo de dados).

    Os encerrados há menos tempo são mantidos para que a detecção de reuso (RN-08) funcione.
    """

    def __init__(self, nova_unidade_de_trabalho: FabricaDeUnidadeDeTrabalho, relogio: Relogio):
        self._nova_uow = nova_unidade_de_trabalho
        self._relogio = relogio

    def executar(self) -> int:
        limite = self._relogio.agora() - RETENCAO_TOKENS_ENCERRADOS
        with self._nova_uow() as uow:
            removidos = uow.refresh_tokens.remover_encerrados_antes_de(limite)
            uow.commit()
        _log.info("Limpeza de refresh tokens: %d removido(s)", removidos)
        return removidos


@dataclass(frozen=True)
class UsuarioDeSeed:
    nome: str
    email: str
    perfil: Perfil
    senha: str = field(repr=False)


class SemearUsuariosDeDesenvolvimento:
    """Seed do perfil dev (RNF-BE-24): cria os usuários que ainda não existem."""

    def __init__(
        self,
        nova_unidade_de_trabalho: FabricaDeUnidadeDeTrabalho,
        codificador: CodificadorDeSenha,
        relogio: Relogio,
    ) -> None:
        self._nova_uow = nova_unidade_de_trabalho
        self._codificador = codificador
        self._relogio = relogio

    def executar(self, usuarios: list[UsuarioDeSeed]) -> None:
        with self._nova_uow() as uow:
            for dados in usuarios:
                if uow.usuarios.existe_email(Usuario.normalizar_email(dados.email)):
                    continue
                uow.usuarios.adicionar(
                    Usuario(
                        id=uuid.uuid4(),
                        nome=dados.nome,
                        email=dados.email,
                        senha_hash=self._codificador.gerar_hash(dados.senha),
                        perfil=dados.perfil,
                        criado_em=self._relogio.agora(),
                    )
                )
                _log.info("Seed de desenvolvimento: usuário %s criado", dados.perfil)
            uow.commit()
