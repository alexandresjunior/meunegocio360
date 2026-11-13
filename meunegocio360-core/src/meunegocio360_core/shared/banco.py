"""Acesso ao PostgreSQL com SQLAlchemy.

O schema é criado e evoluído SOMENTE pelas migrations do Alembic (RNF-BE-20, RNF-BE-21):
a aplicação nunca chama ``metadata.create_all``.
"""

from sqlalchemy import MetaData, create_engine
from sqlalchemy.orm import Session, registry, sessionmaker

from meunegocio360_core.shared.config import ConfiguracaoBanco

# Nomes previsíveis para restrições e índices (usados também nas migrations).
metadata = MetaData(
    naming_convention={
        "pk": "pk_%(table_name)s",
        "uq": "uq_%(table_name)s_%(column_0_name)s",
        "ix": "ix_%(table_name)s_%(column_0_name)s",
        "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
        "ck": "ck_%(table_name)s_%(constraint_name)s",
    }
)

# Mapeamento imperativo: as entidades de domínio são classes Python puras, e o mapeamento
# para tabelas fica na camada infra de cada feature (RNF-010).
mapeador = registry(metadata=metadata)

FabricaDeSessoes = sessionmaker[Session]


def criar_fabrica_de_sessoes(config: ConfiguracaoBanco) -> FabricaDeSessoes:
    engine = create_engine(config.url_sqlalchemy, pool_pre_ping=True)
    return sessionmaker(engine, expire_on_commit=False)
