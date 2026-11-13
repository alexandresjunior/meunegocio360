"""Entidade RefreshToken: guarda apenas o hash do valor entregue ao navegador (RN-06, RN-09)."""

import uuid
from datetime import datetime, timedelta


class RefreshToken:
    versao: int

    def __init__(
        self,
        *,
        id: uuid.UUID,
        usuario_id: uuid.UUID,
        familia_id: uuid.UUID,
        token_hash: str,
        expira_em: datetime,
        criado_em: datetime,
    ) -> None:
        self.id = id
        self.usuario_id = usuario_id
        self.familia_id = familia_id
        self.token_hash = token_hash
        self.expira_em = expira_em
        self.revogado_em: datetime | None = None
        self.criado_em = criado_em
        self.atualizado_em = criado_em

    @classmethod
    def emitir(
        cls,
        *,
        usuario_id: uuid.UUID,
        familia_id: uuid.UUID,
        token_hash: str,
        agora: datetime,
        validade: timedelta,
    ) -> "RefreshToken":
        return cls(
            id=uuid.uuid4(),
            usuario_id=usuario_id,
            familia_id=familia_id,
            token_hash=token_hash,
            expira_em=agora + validade,
            criado_em=agora,
        )

    @property
    def esta_revogado(self) -> bool:
        return self.revogado_em is not None

    def esta_expirado(self, agora: datetime) -> bool:
        return self.expira_em <= agora

    def revogar(self, agora: datetime) -> None:
        if self.revogado_em is None:
            self.revogado_em = agora
            self.atualizado_em = agora

    def __repr__(self) -> str:  # nunca expor token_hash
        return f"RefreshToken(id={self.id}, familia_id={self.familia_id})"
