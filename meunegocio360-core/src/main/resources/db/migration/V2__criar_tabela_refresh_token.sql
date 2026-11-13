-- RF-BE-001: refresh tokens rotativos. Guarda apenas o hash SHA-256 (RN-09).
-- atualizado_em e versao seguem o padrão de toda tabela do projeto (RNF-BE-22).
CREATE TABLE refresh_token (
    id            BINARY(16)  NOT NULL,
    usuario_id    BINARY(16)  NOT NULL,
    familia_id    BINARY(16)  NOT NULL,
    token_hash    CHAR(64)    NOT NULL,
    expira_em     DATETIME(6) NOT NULL,
    revogado_em   DATETIME(6) NULL,
    criado_em     DATETIME(6) NOT NULL,
    atualizado_em DATETIME(6) NOT NULL,
    versao        BIGINT      NOT NULL,
    CONSTRAINT pk_refresh_token PRIMARY KEY (id),
    CONSTRAINT uk_refresh_token_hash UNIQUE (token_hash),
    CONSTRAINT fk_refresh_token_usuario FOREIGN KEY (usuario_id) REFERENCES usuario (id)
);

CREATE INDEX ix_refresh_token_usuario ON refresh_token (usuario_id);
CREATE INDEX ix_refresh_token_familia ON refresh_token (familia_id);
CREATE INDEX ix_refresh_token_expira_em ON refresh_token (expira_em);
