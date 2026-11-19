"""Interfaces que o domínio e os casos de uso esperam; ``infra`` as implementa (RNF-010)."""

import uuid
from dataclasses import dataclass, field
from datetime import datetime
from typing import Protocol

from meunegocio360_core.auth.domain.refresh_token import RefreshToken
from meunegocio360_core.auth.domain.usuario import Usuario


class RepositorioDeUsuarios(Protocol):
    def buscar_por_email_para_atualizacao(self, email: str) -> Usuario | None:
        """Busca e bloqueia a linha (``FOR UPDATE``) para evitar corrida no contador (RN-04)."""
        ...

    def buscar_por_id(self, usuario_id: uuid.UUID) -> Usuario | None: ...

    def existe_email(self, email: str) -> bool: ...

    def adicionar(self, usuario: Usuario) -> None: ...


class RepositorioDeRefreshTokens(Protocol):
    def adicionar(self, token: RefreshToken) -> None: ...

    def buscar_por_hash_para_atualizacao(self, token_hash: str) -> RefreshToken | None:
        """Busca e bloqueia a linha: só uma renovação concorrente vence (RN-07, RN-08)."""
        ...

    def revogar_familia(self, familia_id: uuid.UUID, agora: datetime) -> int: ...

    def revogar_sessoes_do_usuario(self, usuario_id: uuid.UUID, agora: datetime) -> int: ...

    def remover_encerrados_antes_de(self, limite: datetime) -> int: ...


class CodificadorDeSenha(Protocol):
    def gerar_hash(self, senha: str) -> str: ...

    def confere(self, senha: str, senha_hash: str) -> bool: ...

    def simular_verificacao(self, senha: str) -> None:
        """Custo equivalente ao de ``confere`` para e-mails inexistentes (RN-03)."""
        ...


@dataclass(frozen=True)
class TokenDeAcesso:
    valor: str = field(repr=False)
    expira_em_segundos: int


class EmissorDeTokenDeAcesso(Protocol):
    def emitir(self, usuario: Usuario, agora: datetime) -> TokenDeAcesso: ...


class GeradorDeRefreshToken(Protocol):
    def gerar(self) -> str:
        """Valor opaco e aleatório (mínimo de 256 bits), seguro para cookie."""
        ...

    def calcular_hash(self, valor: str) -> str: ...
