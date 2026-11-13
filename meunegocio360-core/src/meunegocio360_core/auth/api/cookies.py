"""Cookie do refresh token (RF-BE-001, seção "Cookie de refresh")."""

from dataclasses import dataclass

from starlette.responses import Response

NOME = "mn360_refresh"
CAMINHO = "/api/v1/auth"  # o navegador só envia o cookie aos endpoints de autenticação


@dataclass(frozen=True)
class CookieDeRefresh:
    seguro: bool
    validade_segundos: int  # igual à validade do refresh token no banco

    def gravar(self, resposta: Response, valor: str) -> None:
        resposta.set_cookie(
            NOME,
            valor,
            max_age=self.validade_segundos,
            path=CAMINHO,
            secure=self.seguro,
            httponly=True,
            samesite="strict",
        )

    def limpar(self, resposta: Response) -> None:
        resposta.set_cookie(
            NOME,
            "",
            max_age=0,
            expires=0,
            path=CAMINHO,
            secure=self.seguro,
            httponly=True,
            samesite="strict",
        )
