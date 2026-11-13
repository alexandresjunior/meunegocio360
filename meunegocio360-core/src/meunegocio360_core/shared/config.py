"""Configuração por variáveis de ambiente (RNF-052, RNF-BE-31, RNF-BE-32).

Em desenvolvimento, as variáveis vêm do ``.env`` da raiz do repositório (``../.env``, relativo à
pasta do serviço). Nos demais ambientes, vêm do próprio ambiente (painel do Render, compose).
Variáveis de ambiente sempre prevalecem sobre o arquivo.
"""

from functools import cached_property
from typing import Annotated, Literal

from pydantic import Field, SecretStr, ValidationError, field_validator, model_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict
from sqlalchemy.engine import URL, make_url

TAMANHO_MINIMO_JWT_SECRET_BYTES = 32

_CONFIG_COMUM = SettingsConfigDict(
    env_file="../.env",
    env_file_encoding="utf-8",
    extra="ignore",
    case_sensitive=False,
)


class ConfiguracaoBanco(BaseSettings):
    """Somente o necessário para conectar ao banco (usado também pelo Alembic)."""

    model_config = _CONFIG_COMUM

    db_url: str
    db_user: str
    db_password: SecretStr

    @cached_property
    def url_sqlalchemy(self) -> URL:
        """URL completa, com o driver psycopg e as credenciais de DB_USER/DB_PASSWORD."""
        url = make_url(self.db_url)
        if url.drivername in ("postgres", "postgresql"):
            url = url.set(drivername="postgresql+psycopg")
        return url.set(username=self.db_user, password=self.db_password.get_secret_value())


class Configuracao(ConfiguracaoBanco):
    """Configuração completa da aplicação. Falha na criação se algo obrigatório faltar."""

    app_env: Literal["dev", "test", "prod"]

    jwt_secret: SecretStr
    cors_allowed_origins: Annotated[list[str], NoDecode]

    app_auth_cookie_secure: bool = True
    app_auth_max_tentativas: int = Field(default=5, gt=0)
    app_auth_bloqueio_minutos: int = Field(default=15, gt=0)
    app_auth_jwt_expiracao_minutos: int = Field(default=15, gt=0)
    app_auth_refresh_expiracao_dias: int = Field(default=7, gt=0)

    seed_admin_senha: SecretStr | None = None
    seed_usuario_senha: SecretStr | None = None

    @field_validator("jwt_secret")
    @classmethod
    def _validar_jwt_secret(cls, valor: SecretStr) -> SecretStr:
        if len(valor.get_secret_value().encode("utf-8")) < TAMANHO_MINIMO_JWT_SECRET_BYTES:
            raise ValueError(f"deve ter no mínimo {TAMANHO_MINIMO_JWT_SECRET_BYTES} bytes")
        return valor

    @field_validator("cors_allowed_origins", mode="before")
    @classmethod
    def _separar_origens(cls, valor: object) -> object:
        if isinstance(valor, str):
            return [origem.strip().rstrip("/") for origem in valor.split(",") if origem.strip()]
        return valor

    @field_validator("cors_allowed_origins")
    @classmethod
    def _validar_origens(cls, origens: list[str]) -> list[str]:
        if not origens:
            raise ValueError("informe ao menos uma origem")
        if any("*" in origem for origem in origens):
            raise ValueError("curinga '*' não é permitido (RNF-BE-42)")
        return origens

    @model_validator(mode="after")
    def _validar_por_ambiente(self) -> "Configuracao":
        if not self.app_auth_cookie_secure and self.app_env != "dev":
            raise ValueError("APP_AUTH_COOKIE_SECURE=false só é permitido com APP_ENV=dev")
        if self.app_env == "dev" and not (self.seed_admin_senha and self.seed_usuario_senha):
            raise ValueError("SEED_ADMIN_SENHA e SEED_USUARIO_SENHA são obrigatórias em dev")
        return self

    @property
    def producao(self) -> bool:
        return self.app_env == "prod"


class ConfiguracaoInvalidaError(RuntimeError):
    """Erro de inicialização sem o valor das variáveis (que podem ser segredos)."""


def _carregar[T: BaseSettings](classe: type[T]) -> T:
    try:
        return classe()
    except ValidationError as erro:
        # O ValidationError do Pydantic inclui o valor recebido; aqui só nome e motivo (RNF-022).
        problemas = "; ".join(
            f"{'.'.join(str(p) for p in e['loc']).upper() or 'configuração'}: {e['msg']}"
            for e in erro.errors(include_input=False, include_url=False)
        )
        raise ConfiguracaoInvalidaError(f"Configuração inválida: {problemas}") from None


def carregar_configuracao() -> Configuracao:
    return _carregar(Configuracao)


def carregar_configuracao_banco() -> ConfiguracaoBanco:
    return _carregar(ConfiguracaoBanco)
