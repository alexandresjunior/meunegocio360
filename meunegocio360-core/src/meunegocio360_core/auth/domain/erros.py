"""Erros de negócio da autenticação. A tradução para HTTP está em ``auth/api/problemas.py``."""

from meunegocio360_core.shared.dominio import ErroDeNegocio


class CredenciaisInvalidasError(ErroDeNegocio):
    """E-mail inexistente, senha incorreta ou usuário inativo: sempre o mesmo erro (RN-03)."""


class ContaTemporariamenteBloqueadaError(ErroDeNegocio):
    """RN-04: tentativas excedidas."""

    def __init__(self, segundos_restantes: int) -> None:
        super().__init__("conta temporariamente bloqueada")
        self.segundos_restantes = segundos_restantes


class RefreshTokenInvalidoError(ErroDeNegocio):
    """Ausente, desconhecido, expirado, revogado (reuso) ou de usuário inativo/bloqueado."""


class SessaoInvalidaError(ErroDeNegocio):
    """Token de acesso válido, mas o usuário não existe mais ou foi desativado."""
