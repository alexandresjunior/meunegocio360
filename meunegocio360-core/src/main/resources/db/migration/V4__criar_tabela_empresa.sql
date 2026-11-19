-- RF-BE-002: empresa da instalação. É a única tabela de negócio sem empresa_id (RNF-BE-26).
CREATE TABLE empresa (
    id            BINARY(16)   NOT NULL,
    razao_social  VARCHAR(150) NOT NULL,
    nome_fantasia VARCHAR(150) NULL,
    cnpj          CHAR(14)     NOT NULL,
    email         VARCHAR(160) NULL,
    telefone      VARCHAR(11)  NULL,
    fuso_horario  VARCHAR(50)  NOT NULL DEFAULT 'America/Sao_Paulo',
    moeda         CHAR(3)      NOT NULL DEFAULT 'BRL',
    ativa         BOOLEAN      NOT NULL DEFAULT TRUE,
    -- 1 quando ativa, NULL quando inativa. O índice único aceita vários NULL, então no máximo
    -- uma linha pode estar ativa (RN-02), garantido pelo banco e não só pela aplicação.
    ativa_unica   TINYINT GENERATED ALWAYS AS (CASE WHEN ativa THEN 1 END) STORED,
    criado_em     DATETIME(6)  NOT NULL,
    atualizado_em DATETIME(6)  NOT NULL,
    versao        BIGINT       NOT NULL,
    CONSTRAINT pk_empresa PRIMARY KEY (id),
    CONSTRAINT uk_empresa_cnpj UNIQUE (cnpj),
    CONSTRAINT uk_empresa_ativa_unica UNIQUE (ativa_unica),
    CONSTRAINT ck_empresa_cnpj CHECK (cnpj REGEXP '^[0-9]{14}$'),
    CONSTRAINT ck_empresa_telefone CHECK (telefone IS NULL OR telefone REGEXP '^[0-9]{10,11}$'),
    CONSTRAINT ck_empresa_moeda CHECK (moeda IN ('BRL'))
);
