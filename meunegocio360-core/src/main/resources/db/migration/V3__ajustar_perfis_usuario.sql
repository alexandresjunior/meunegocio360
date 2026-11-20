-- RF-BE-002 (RN-07): o perfil USUARIO deixa de existir e passa a OPERADOR_COMERCIAL.
-- A restrição criada na V1 só aceitava ADMIN e USUARIO, por isso é recriada com os novos perfis.
ALTER TABLE usuario DROP CHECK ck_usuario_perfil;

UPDATE usuario SET perfil = 'OPERADOR_COMERCIAL' WHERE perfil = 'USUARIO';

ALTER TABLE usuario
    ADD CONSTRAINT ck_usuario_perfil
        CHECK (perfil IN ('ADMIN', 'OPERADOR_COMERCIAL', 'OPERADOR_FINANCEIRO'));
