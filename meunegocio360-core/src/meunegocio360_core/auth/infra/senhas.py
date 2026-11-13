"""Hash de senha com BCrypt (RNF-023, RN-03, RN-11).

O formato gravado é ``{bcrypt}<hash>``, como no ``DelegatingPasswordEncoder`` previsto no
requisito: o prefixo identifica o algoritmo e permite trocá-lo no futuro sem migrar as senhas.
"""

import secrets

import bcrypt

PREFIXO = "{bcrypt}"
CUSTO = 12


class CodificadorBcrypt:
    def __init__(self, custo: int = CUSTO) -> None:
        self._custo = custo
        # Hash de um valor aleatório, usado só para igualar o tempo de resposta (RN-03).
        self._hash_ficticio = self.gerar_hash(secrets.token_urlsafe(32))

    def gerar_hash(self, senha: str) -> str:
        gerado = bcrypt.hashpw(senha.encode("utf-8"), bcrypt.gensalt(self._custo))
        return PREFIXO + gerado.decode("ascii")

    def confere(self, senha: str, senha_hash: str) -> bool:
        if not senha_hash.startswith(PREFIXO):
            return False
        try:
            return bcrypt.checkpw(
                senha.encode("utf-8"), senha_hash.removeprefix(PREFIXO).encode("ascii")
            )
        except ValueError:
            # bcrypt >= 5 recusa senhas acima de 72 bytes; a API já as rejeita antes (RN-11).
            return False

    def simular_verificacao(self, senha: str) -> None:
        self.confere(senha, self._hash_ficticio)
