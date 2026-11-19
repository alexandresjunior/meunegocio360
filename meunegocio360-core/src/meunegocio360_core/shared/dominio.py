"""Tipos de domínio compartilhados, sem dependência de HTTP nem de banco."""


class ErroDeNegocio(Exception):
    """Base das violações de regra de negócio. A tradução para HTTP fica na camada ``api``."""
