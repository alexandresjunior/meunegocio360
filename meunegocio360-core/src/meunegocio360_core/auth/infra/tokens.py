"""Token de acesso JWT (HS256) e refresh token opaco (RN-05, RN-06, RN-09).

O mesmo serviço emite e valida o JWT. A validação exige algoritmo HS256, emissor, expiração e
as claims obrigatórias; ``alg: none`` ou qualquer outro algoritmo é rejeitado.
"""

import hashlib
import secrets
import uuid
from datetime import datetime, timedelta

import jwt

from meunegocio360_core.auth.domain.portas import TokenDeAcesso
from meunegocio360_core.auth.domain.usuario import Usuario
from meunegocio360_core.shared.seguranca import Principal, TokenDeAcessoInvalidoError

EMISSOR = "meunegocio360-core"
ALGORITMO = "HS256"
CLAIMS_OBRIGATORIAS = ["iss", "sub", "iat", "exp", "jti", "perfil"]


class ServicoJwt:
    def __init__(self, segredo: str, validade: timedelta) -> None:
        self._segredo = segredo.encode("utf-8")
        self._validade = validade

    def emitir(self, usuario: Usuario, agora: datetime) -> TokenDeAcesso:
        expira_em = agora + self._validade
        claims = {
            "iss": EMISSOR,
            "sub": str(usuario.id),
            "iat": int(agora.timestamp()),
            "exp": int(expira_em.timestamp()),
            "jti": str(uuid.uuid4()),
            "perfil": str(usuario.perfil),
        }
        valor = jwt.encode(claims, self._segredo, algorithm=ALGORITMO)
        return TokenDeAcesso(valor=valor, expira_em_segundos=int(self._validade.total_seconds()))

    def verificar(self, token: str) -> Principal:
        try:
            claims = jwt.decode(
                token,
                self._segredo,
                algorithms=[ALGORITMO],
                issuer=EMISSOR,
                options={"require": CLAIMS_OBRIGATORIAS},
            )
            return Principal(usuario_id=uuid.UUID(claims["sub"]), perfil=str(claims["perfil"]))
        except (jwt.InvalidTokenError, ValueError, TypeError, KeyError):
            raise TokenDeAcessoInvalidoError from None


class GeradorDeRefreshTokenSeguro:
    BYTES_ALEATORIOS = 32  # 256 bits

    def gerar(self) -> str:
        # ``secrets`` usa a fonte criptográfica do sistema (equivalente ao SecureRandom).
        return secrets.token_urlsafe(self.BYTES_ALEATORIOS)

    def calcular_hash(self, valor: str) -> str:
        return hashlib.sha256(valor.encode("utf-8")).hexdigest()
