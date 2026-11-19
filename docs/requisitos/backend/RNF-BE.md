# MeuNegocio360 — Requisitos Não Funcionais do Backend

| | |
| --- | --- |
| **Versão** | 3.0 |
| **Atualizado em** | 18/11/2026 |
| **Projeto** | `meunegocio360-*` (módulo por serviço) |
| **Herda de** | [`GERAIS.md`](../GERAIS.md) (todos os RNF se aplicam; aqui só há o que é específico do backend) |
| **Requisitos funcionais** | [`RF-BE-001.md`](./RF-BE-001.md) a [`RF-BE-005.md`](./RF-BE-005.md) (índice em [`GERAIS.md`](../GERAIS.md#2-requisitos-funcionais)) |
## 1. Arquitetura

As regras de arquitetura entre serviços (banco por serviço, contratos, tokens) estão em [`GERAIS.md`](../GERAIS.md#32-microsserviços). A estrutura de pacotes está no [`README.md`](../../../README.md#backend-cada-serviço). Dentro de cada serviço:

| ID | Requisito |
| --- | --- |
| RNF-BE-01 | Rotas (*routers* do FastAPI) DEVEM ser finas: recebem DTO, delegam ao caso de uso e devolvem DTO. Regra de negócio NÃO DEVE ficar em rota nem em repositório. |
| RNF-BE-02 | Entidades de domínio e modelos SQLAlchemy NUNCA DEVEM ser expostos na API. Entrada e saída usam DTOs (modelos Pydantic). |
| RNF-BE-03 | Injeção de dependências DEVE ser explícita: casos de uso recebem suas dependências no **construtor** (`__init__`) e as rotas as obtêm por `Depends`; sem instâncias globais nem criação de dependências dentro da regra de negócio. |
| RNF-BE-04 | Fronteiras transacionais (unidade de trabalho com a sessão do SQLAlchemy e `commit`) ficam na camada `application`. |
| RNF-BE-05 | Uma feature NÃO DEVE acessar diretamente o repositório ou as entidades internas de outra feature. A comunicação é por interface pública do caso de uso. |

## 2. Convenções da API REST

| ID | Requisito |
| --- | --- |
| RNF-BE-10 | Prefixo `/api/v1`. Recursos no plural e em *kebab-case* (`/api/v1/ordens-de-servico`). Verbos HTTP com semântica correta: `GET` (leitura), `POST` (criação/ação), `PUT`/`PATCH` (atualização), `DELETE` (remoção). |
| RNF-BE-11 | JSON em `camelCase` (datas e valores conforme RNF-033). Identificadores públicos são **UUID**, nunca sequenciais. |
| RNF-BE-12 | Códigos de status: `200` leitura/ação, `201` criação (com `Location`), `204` sem conteúdo, `400` requisição inválida, `401` não autenticado, `403` sem permissão, `404` não encontrado, `409` conflito, `422` regra de negócio violada, `429` limite excedido, `500` erro inesperado. |
| RNF-BE-13 | Paginação com parâmetros `page` (a partir de 0), `size` (padrão 20, máximo 100) e `sort`. Resposta: `{ "content": [...], "page": 0, "size": 20, "totalElements": 0, "totalPages": 0 }`. |
| RNF-BE-14 | Todos os erros usam `application/problem+json` (RFC 9457) com o formato abaixo, tratados em um único ponto (tratadores de exceção registrados em `shared/erros.py`). |
| RNF-BE-15 | Erros de regra de negócio DEVEM usar um `code` estável e específico (ex.: `CUSTOMER_HAS_HISTORY`), `detail` claro em português e status `422` (ou `409` para conflito de unicidade e de versão). Violações de integridade do banco NUNCA DEVEM chegar ao cliente como erro genérico `500`: são traduzidas para o erro de negócio correspondente. |
| RNF-BE-16 | Listagens com busca DEVEM aceitar `q` (texto livre) e filtros nomeados, combinados com a paginação (RNF-BE-13). Buscas por texto ignoram maiúsculas e acentos (RNF-BE-26) e o parâmetro `sort` só aceita campos de uma lista permitida. |

Formato padrão de erro:

```json
{
  "type": "https://meunegocio360.com.br/problemas/validacao",
  "title": "Dados inválidos",
  "status": 400,
  "detail": "Um ou mais campos são inválidos.",
  "instance": "/api/v1/auth/login",
  "code": "VALIDATION_ERROR",
  "traceId": "9f1c2e7a-...",
  "errors": [
    { "field": "email", "message": "deve ser um e-mail válido" }
  ]
}
```

O campo `code` é um identificador estável, em `UPPER_SNAKE_CASE`, usado pelo frontend para decidir o comportamento. O texto de `detail` e `message` NÃO DEVE ser usado como lógica pelo cliente.

## 3. Persistência

| ID | Requisito |
| --- | --- |
| RNF-BE-20 | Schema evoluído exclusivamente por migrations Alembic em `migrations/versions/`, nomeadas `NNNN_<descricao>.py` (ex.: `0003_ajustar_perfis_usuario.py`). Migrations aplicadas NUNCA são editadas. |
| RNF-BE-21 | `Base.metadata.create_all()` NUNCA é usado: o schema vem só das migrations (`alembic upgrade head`), em todos os ambientes. |
| RNF-BE-22 | Tabelas em `snake_case` e no singular ou plural de forma consistente (padrão do projeto: **singular**, ex.: `usuario`). Toda tabela tem `id` (UUID), `criado_em`, `atualizado_em` (UTC) e `versao` (controle otimista com `version_id_col` do SQLAlchemy). |
| RNF-BE-23 | Restrições de integridade (`NOT NULL`, `UNIQUE`, chaves estrangeiras, índices em colunas de busca) DEVEM existir no banco, e não apenas na aplicação. |
| RNF-BE-24 | Dados de seed apenas para o ambiente `dev`, por migration ou *runner* dedicado. Nunca em `prod`. |
| RNF-BE-25 | Na fase de testes, testes de repositório e de integração DEVEM usar PostgreSQL real via Testcontainers, e não um banco em memória com dialeto diferente. |
| RNF-BE-26 | Tabelas de negócio têm `empresa_id` (`NOT NULL`, chave estrangeira para `empresa`) e os índices de busca e de unicidade começam por `empresa_id` (RNF-096). Colunas de texto pesquisáveis usam a *collation* ICU não determinística `ci_ai` (sem distinção de maiúsculas e acentos), criada por migration: `CREATE COLLATION ci_ai (provider = icu, locale = 'und-u-ks-level1', deterministic = false)`. O PostgreSQL 18 aceita `LIKE`/`ILIKE` com esse tipo de *collation*. |
| RNF-BE-27 | CPF e CNPJ são armazenados **somente com dígitos** (11 e 14 posições) e validados pelos dígitos verificadores em um único validador reutilizável em `shared`. A máscara é responsabilidade do frontend. |
| RNF-BE-28 | Atualizações usam **controle otimista**: o cliente envia a `versao` lida e, se ela estiver desatualizada, a API responde `409` com `code` `VERSION_CONFLICT` (RNF-BE-22). |

## 4. Configuração e ambientes

| ID | Requisito |
| --- | --- |
| RNF-BE-31 | Em desenvolvimento, a configuração (pydantic-settings) DEVE ler o `.env` da raiz (`env_file="../.env"`); nos demais ambientes as variáveis vêm do ambiente (RNF-052). As variáveis são as documentadas em `.env.example`. A aplicação DEVE escutar na porta `${PORT:-8080}` (RNF-101), definida no comando do `Dockerfile`. |
| RNF-BE-32 | A aplicação DEVE falhar na inicialização (*fail fast*) se uma variável obrigatória estiver ausente ou inválida (por exemplo, `JWT_SECRET` com menos de 32 bytes). |

## 5. Segurança, observabilidade e qualidade

| ID | Requisito |
| --- | --- |
| RNF-BE-40 | Middleware de autenticação explícito, sem sessão no servidor e *deny-by-default* (toda rota exige token, RNF-021), com as rotas públicas listadas e documentadas. Não é necessário token CSRF porque a autenticação das APIs é por cabeçalho `Authorization`; os dois únicos endpoints que usam cookie (`/auth/refresh` e `/auth/logout`) DEVEM ser protegidos por `SameSite=Strict`, cookie restrito ao seu caminho e verificação do cabeçalho `Origin` contra a lista de origens permitidas. |
| RNF-BE-41 | Cabeçalhos de segurança aplicados por middleware em todas as respostas (`X-Content-Type-Options`, `Cache-Control` em respostas autenticadas, HSTS em produção). |
| RNF-BE-42 | CORS configurado uma única vez (`CORSMiddleware`), lendo as origens permitidas de `CORS_ALLOWED_ORIGINS` (a mesma lista usada na verificação de `Origin`), com `allow_credentials=True` e, portanto, **sem** curinga `*`, jamais em produção. O frontend usa a mesma origem (RNF-103); o CORS atende a chamadas diretas de outras origens. |
| RNF-BE-43 | Um filtro DEVE ler ou gerar `X-Request-Id`, colocá-lo no MDC dos logs e devolvê-lo na resposta e no campo `traceId` dos erros (RNF-050). |
| RNF-BE-44 | Logs estruturados (JSON, com o módulo `logging` da biblioteca padrão) nos ambientes `test` e `prod`. Eventos de segurança (login com sucesso, falha, bloqueio) DEVEM ser registrados **sem** senha, token ou e-mail completo (RNF-023, RNF-025). |
| RNF-BE-45 | `uv run ruff format --check && uv run ruff check` DEVE passar antes de cada PR. A partir da fase de testes, `uv run pytest` também, com as regras de arquitetura e a cobertura (pytest-cov). |
| RNF-BE-46 | Na fase de testes: pytest (com *fakes* das portas em vez de *mocks* sempre que possível); `TestClient` do FastAPI para a camada web; Testcontainers com PostgreSQL para persistência e integração; tokens emitidos pelo próprio emissor de teste para cenários autenticados. |
| RNF-BE-47 | A autorização por perfil DEVE ser aplicada nos *endpoints* (por exemplo, uma dependência `Depends(exigir_perfil(...))` em cada rota) conforme a matriz de perfis declarada em cada RF; falta de permissão responde `403` com `code` `ACCESS_DENIED`. A matriz é testada para cada perfil. |
