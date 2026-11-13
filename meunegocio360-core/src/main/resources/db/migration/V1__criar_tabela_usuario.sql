-- RF-BE-001: usuários que podem se autenticar no Núcleo.
CREATE TABLE usuario (
    id                BINARY(16)   NOT NULL,
    nome              VARCHAR(120) NOT NULL,
    email             VARCHAR(160) NOT NULL,
    senha_hash        VARCHAR(100) NOT NULL,
    perfil            VARCHAR(20)  NOT NULL,
    ativo             BOOLEAN      NOT NULL DEFAULT TRUE,
    tentativas_falhas INT          NOT NULL DEFAULT 0,
    bloqueado_ate     DATETIME(6)  NULL,
    ultimo_login_em   DATETIME(6)  NULL,
    criado_em         DATETIME(6)  NOT NULL,
    atualizado_em     DATETIME(6)  NOT NULL,
    versao            BIGINT       NOT NULL,
    CONSTRAINT pk_usuario PRIMARY KEY (id),
    CONSTRAINT uk_usuario_email UNIQUE (email),
    CONSTRAINT ck_usuario_perfil CHECK (perfil IN ('ADMIN', 'USUARIO')),
    CONSTRAINT ck_usuario_tentativas CHECK (tentativas_falhas >= 0)
);
