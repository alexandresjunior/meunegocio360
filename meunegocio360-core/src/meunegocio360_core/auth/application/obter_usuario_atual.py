"""Caso de uso: dados do usuário autenticado (``GET /auth/me``)."""

import uuid

from meunegocio360_core.auth.application.comum import FabricaDeUnidadeDeTrabalho, UsuarioResumo
from meunegocio360_core.auth.domain.erros import SessaoInvalidaError


class ObterUsuarioAtual:
    def __init__(self, nova_unidade_de_trabalho: FabricaDeUnidadeDeTrabalho) -> None:
        self._nova_uow = nova_unidade_de_trabalho

    def executar(self, usuario_id: uuid.UUID) -> UsuarioResumo:
        with self._nova_uow() as uow:
            usuario = uow.usuarios.buscar_por_id(usuario_id)
            if usuario is None or not usuario.ativo:
                raise SessaoInvalidaError
            return UsuarioResumo.de(usuario)
