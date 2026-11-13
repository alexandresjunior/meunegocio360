# Requisições manuais (REST Client)

Arquivos `.http` para verificar manualmente os critérios de aceite dos requisitos, até a fase de testes automatizados ([RNF-016](../../docs/requisitos-gerais.md#33-dependências)). Use a extensão **REST Client** (`humao.rest-client`) do VS Code: abra um arquivo e clique em **Send Request**, acima de cada requisição.

| Arquivo | Cenários de RF-BE-001 |
| --- | --- |
| `01-fluxo-de-sessao.http` | Login, `/me`, renovação, logout e refresh recusado após logout. |
| `02-erros-e-seguranca.http` | Credenciais inválidas, e-mail inexistente, validação, tokens inválidos, *deny-by-default*, `Origin` não permitida. |
| `03-reuso-de-refresh-token.http` | Detecção de reuso e revogação da família. |
| `04-bloqueio-por-tentativas.http` | Bloqueio após 5 falhas, `429` com `Retry-After` e desbloqueio. |

## Preparação

1. No `.env` da raiz:
   - `JWT_SECRET` com pelo menos 32 bytes (`openssl rand -base64 48`). Sem isso a aplicação não sobe;
   - `SEED_ADMIN_SENHA` e `SEED_USUARIO_SENHA` com 8 a 72 caracteres. São as senhas de `admin@meunegocio360.com.br` e `usuario@meunegocio360.com.br`, criados apenas no perfil `dev`;
   - `APP_AUTH_COOKIE_SECURE=false`. O REST Client não reenvia cookies `Secure` em `http://`, e o requisito permite esse valor somente no perfil `dev`;
   - opcional: `APP_AUTH_BLOQUEIO_MINUTOS=1`, para testar o desbloqueio sem esperar 15 minutos.
2. `docker compose up -d` na raiz e `./mvnw spring-boot:run -Dspring-boot.run.profiles=dev` em `meunegocio360-core`.
3. Confira que a configuração `rest-client.rememberCookiesForSubsequentRequests` está ativa (padrão `true`). É ela que guarda o cookie `mn360_refresh` entre as requisições, como faria o navegador.

As senhas são pedidas na hora de enviar (`# @prompt`) e nunca ficam gravadas nos arquivos ([RNF-022](../../docs/requisitos-gerais.md#34-segurança-e-privacidade)).

## Observações

- Requisições nomeadas (`# @name`) só podem ser referenciadas dentro do mesmo arquivo. Por isso, cada arquivo faz o próprio login.
- O cookie guardado vale para `localhost`. Quando é preciso enviar um cookie escolhido à mão (reuso, token desconhecido), a requisição usa `127.0.0.1`. Assim o REST Client não troca o cabeçalho `Cookie` pelo que guardou.
- Para inspecionar o banco: `docker exec -it meunegocio360-core-db mysql -u meunegocio360 -p meunegocio360_core` e, por exemplo, `SELECT HEX(familia_id), token_hash, revogado_em FROM refresh_token;`. Só o hash SHA-256 é gravado.
