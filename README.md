<p align="center">
  <img src="./assets/logo_meunegocio360_v1.png" alt="MeuNegócio360" width="600">
</p>

Sistema comercial de gestão de clientes, serviços e suprimentos para pequenas e médias empresas, desenvolvido com uso assistido de IA em todas as etapas do ciclo de desenvolvimento (requisitos, código, testes, revisão e deploy).

Este README descreve **como o projeto é organizado e como trabalhar nele**. O que o sistema deve fazer (requisitos funcionais e não funcionais) está em [`docs/requisitos/`](./docs/requisitos).

## Sumário

1. [Visão geral](#1-visão-geral)
2. [Arquitetura](#2-arquitetura)
3. [Stack tecnológica](#3-stack-tecnológica)
4. [Estrutura do projeto](#4-estrutura-do-projeto)
5. [Primeiros passos](#5-primeiros-passos)
6. [Contribuições](#6-contribuições)
7. [Implantação](#7-implantação)
8. [Documentação](#8-documentação)

## 1. Visão geral

O MeuNegocio360 é organizado em três módulos de negócio:

| Módulo | Objetivo | Funcionalidades previstas |
| --- | --- | --- |
| **Núcleo** | Base empresarial | Gestão de usuários, clientes, fornecedores, produtos, serviços, vendas, contas (a pagar e a receber), fluxo de caixa e dashboard. |
| **Serviços** | Operação de serviços | Gestão de técnicos, equipamentos, solicitações, ordens de serviço (OS), execução, evidências, aceite e faturamento da OS. |
| **Suprimentos** | Estoque e compras | Movimentações, estoque mínimo, inventário, compras, reposição, curva ABC, giro e alertas. |

Estado atual: apenas o **Núcleo** (`meunegocio360-core`) e o frontend (`meunegocio360-js`) existem. Serviços e Suprimentos serão implementados futuramente. A base parte de um esqueleto mínimo do backend (FastAPI) e do projeto gerado pelo Vite; as funcionalidades entram requisito a requisito, conforme o índice em [`docs/requisitos/GERAIS.md`](./docs/requisitos/GERAIS.md#2-requisitos-funcionais).

## 2. Arquitetura

O sistema segue uma arquitetura de **microsserviços**, consumida por **um único frontend** (SPA):

| Serviço | Pasta | Responsabilidade | Estado |
| --- | --- | --- | --- |
| Núcleo | `meunegocio360-core` | Identidade e autenticação, usuários, clientes, fornecedores, produtos, serviços (catálogo), vendas, contas, fluxo de caixa e dashboard. | Em desenvolvimento |
| Serviços | `meunegocio360-servicos` | Técnicos, equipamentos, solicitações, OS, execução, evidências, aceite e faturamento da OS. | Futuro |
| Suprimentos | `meunegocio360-suprimentos` | Movimentações, estoque mínimo, inventário, compras, reposição, curva ABC, giro e alertas. | Futuro |

Cada serviço tem código, build, banco de dados e implantação próprios. As regras que governam essa separação (banco por serviço, contratos versionados, emissão de tokens pelo Núcleo etc.) estão nos [requisitos de arquitetura](./docs/requisitos/GERAIS.md#32-microsserviços).

### Decisões de arquitetura

| Decisão | Resumo |
| --- | --- |
| Microsserviços | Um serviço por módulo de negócio, no formato monorepo (uma pasta por serviço). Cada serviço é autocontido e pode ser separado em repositório próprio sem mudança de código. |
| Backend em Python e PostgreSQL | Os serviços de backend usam Python com FastAPI e SQLAlchemy, e cada um tem seu próprio banco PostgreSQL. O PostgreSQL é oferecido como banco gerenciado pelo Render, o que simplifica a implantação. |
| API REST *stateless* | Versionada em `/api/v1`, documentada em OpenAPI. |
| Autenticação | JWT de acesso de curta duração e refresh token rotativo em cookie `HttpOnly`, emitidos pelo Núcleo. Detalhes em [RF-BE-001](./docs/requisitos/backend/RF-BE-001.md). |
| Frontend em JavaScript | Sem TypeScript. Contratos de dados são documentados por OpenAPI e *schemas* Zod. |
| Estilos com Bootstrap | Toda a interface é construída sobre o Bootstrap 5, com a identidade visual aplicada no tema. Ver [requisitos do frontend](./docs/requisitos/frontend/RNF-FE.md#2-estilos-e-identidade-visual). |
| Mesma origem para a API | O navegador sempre chama a API por caminho relativo (`/api`): em desenvolvimento, o servidor do Vite repassa a chamada ao backend; em produção, o Netlify faz o repasse ao Render. Assim o cookie de refresh permanece *first-party* com `SameSite=Strict`. |
| Implantação | Frontend no Netlify e backend no Render (seção [Implantação](#7-implantação)). |

Decisões novas e relevantes DEVEM ser registradas como ADR em `docs/adr/` (ver [RNF-070](./docs/requisitos/GERAIS.md#39-documentação)).

## 3. Stack tecnológica

| Camada | Tecnologia |
| --- | --- |
| Backend (cada serviço) | Python 3.13, FastAPI, Uvicorn, Pydantic v2 e pydantic-settings, SQLAlchemy 2.x, Alembic, uv (dependências e ambiente virtual) |
| Banco de dados | PostgreSQL 18, um banco por serviço |
| Frontend | React 19, Vite, JavaScript, Bootstrap 5 |
| Ambiente local | Docker Compose (PostgreSQL e backend) |
| Implantação | Netlify (frontend) e Render (backend, via Docker; PostgreSQL gerenciado) |
| IDE | Visual Studio Code, com extensões de linguagem e de assistente de IA |

As versões de cada biblioteca são as do `pyproject.toml`/`uv.lock` e do `package.json`. Bibliotecas adicionais são introduzidas por cada requisito que as exige ([RNF-015](./docs/requisitos/GERAIS.md#33-dependências)).

## 4. Estrutura do projeto

```
meunegocio360/
├── docs/                         # requisitos (RF e RNF) e ADRs (docs/adr/)
├── meunegocio360-core/           # microsserviço Núcleo (FastAPI)
├── meunegocio360-servicos/       # (futuro) microsserviço Serviços
├── meunegocio360-suprimentos/    # (futuro) microsserviço Suprimentos
├── meunegocio360-js/             # frontend único (React + Vite)
│   └── .env.example              # variáveis públicas do frontend (VITE_*)
├── compose.yaml                  # ambiente local (PostgreSQL e backend do Núcleo)
├── .env.example                  # variáveis de ambiente do backend e do compose
├── .gitignore                    # ignora .env e arquivos locais
├── AGENTS.md                     # instruções de contexto para assistentes de IA
└── README.md                     # este arquivo
```

### Backend (cada serviço)

Pacote raiz do Núcleo: `meunegocio360_core` (*src layout*), organizado por funcionalidade (*package by feature*):

```
meunegocio360-core/
├── pyproject.toml                # dependências e configuração das ferramentas (Ruff)
├── uv.lock                       # versões travadas (versionado)
├── alembic.ini                   # configuração das migrations
├── migrations/versions/          # migrations Alembic
├── Dockerfile                    # imagem de implantação (seção 7.1)
└── src/meunegocio360_core/
    ├── main.py                   # criação da aplicação FastAPI
    ├── <feature>/                # ex.: auth, usuario, cliente, produto
    │   ├── api/                  # routers, schemas Pydantic de entrada/saída, mapeadores
    │   ├── application/          # casos de uso (serviços de aplicação), transações
    │   ├── domain/               # entidades, regras de negócio, interfaces de repositório
    │   └── infra/                # repositórios SQLAlchemy, adaptadores externos
    └── shared/                   # transversais: erros, segurança, configuração, auditoria
```

A configuração é lida de variáveis de ambiente por classes do pydantic-settings, em `shared/`; em desenvolvimento, elas vêm do `.env` da raiz. O ambiente é escolhido pela variável `APP_ENV` (`dev`, `test` ou `prod`).

### Frontend

```
meunegocio360-js/src
├── app/                        # bootstrap: providers, roteador, layout raiz
├── features/
│   └── <feature>/              # ex.: auth, clientes, produtos
│       ├── api/                # chamadas HTTP da feature
│       ├── components/         # componentes exclusivos da feature
│       ├── hooks/              # hooks da feature (useLogin, useAuth ...)
│       ├── pages/              # telas roteáveis
│       ├── schemas.js          # schemas Zod
│       └── index.js            # API pública da feature
├── shared/
│   ├── ui/                     # componentes compartilhados (sobre react-bootstrap)
│   ├── lib/                    # cliente HTTP, utilitários
│   └── styles/                 # tema do Bootstrap (theme.scss) e estilos globais
└── test/                       # configuração e dados de teste (fase de testes)
```

As regras que justificam essa organização estão em [RNF-010, RNF-011](./docs/requisitos/GERAIS.md#31-arquitetura-e-qualidade-de-código), [RNF-BE-01 a 05](./docs/requisitos/backend/RNF-BE.md) e [RNF-FE-01 a 09](./docs/requisitos/frontend/RNF-FE.md).

## 5. Primeiros passos

### Pré-requisitos

Docker com Docker Compose, Node.js (versão LTS) com npm, Git e Visual Studio Code. Python e uv não precisam estar instalados na máquina: o backend roda em contêiner.

### Passo a passo

```bash
# 1. Variáveis de ambiente (preencha as senhas e o JWT_SECRET; o .env nunca é versionado)
cp .env.example .env
cp meunegocio360-js/.env.example meunegocio360-js/.env.local

# 2. Banco e backend do Núcleo em contêineres (as migrations são aplicadas na subida)
docker compose up -d --build

# 3. Frontend (em outro terminal)
cd meunegocio360-js
npm install
npm run dev
```

A descrição de cada variável está comentada em [`.env.example`](./.env.example) e em [`meunegocio360-js/.env.example`](./meunegocio360-js/.env.example). Com tudo no ar: backend em `http://localhost:8080` (Swagger UI em `/swagger-ui.html`) e frontend em `http://localhost:5173`. Endpoints e telas existem à medida que os requisitos são implementados.

### Comandos úteis

| Onde | Comando | Para quê |
| --- | --- | --- |
| Raiz | `docker compose up -d --build` / `docker compose down` | Sobe (reconstruindo o backend) / para os contêineres (mantém os dados). |
| Raiz | `docker compose down -v` | Para e **apaga** os dados locais do banco. |
| Raiz | `docker compose logs -f core-api` | Acompanha os logs do backend. |
| `meunegocio360-core` | `uv run ruff format --check && uv run ruff check` | Executa as verificações do backend (exige uv instalado). |
| `meunegocio360-core` | `uv run ruff format` | Formata o código (exige uv instalado). |
| `meunegocio360-js` | `npm run lint` | Verifica o código com ESLint. |
| `meunegocio360-js` | `npm run build` | Gera o build de produção em `dist/`. |
| `meunegocio360-js` | `npm run format` | Formata com Prettier (disponível a partir de [RF-FE-001](./docs/requisitos/frontend/RF-FE-001.md)). |

Scripts de teste serão acrescentados na fase de testes (ver [Contribuições](#6-contribuições)).

### Conceitos de DevOps (introdutórios)

O foco do projeto é o desenvolvimento de software. Os conceitos de DevOps usados aqui são apenas introdutórios e já vêm prontos:

| Conceito | Onde aparece |
| --- | --- |
| Contêineres | `compose.yaml` (banco local) e `Dockerfile` do backend (implantação no Render). |
| Configuração por variáveis de ambiente (*12-factor*) | `.env.example` e painéis do Netlify e do Render. |
| Entrega contínua | Netlify e Render publicam automaticamente a cada *push* na branch configurada. |
| *Health check* e *rollback* | `/actuator/health` verificado pelo Render; retorno a um deploy anterior pelos painéis. |

Estão **fora de escopo**: pipelines de CI (por exemplo, GitHub Actions), orquestração (Kubernetes), infraestrutura como código e monitoramento avançado.

## 6. Contribuições

Todo trabalho acontece em uma **branch do seu fork** e segue o **fluxo de desenvolvimento assistido por IA**, uma branch por requisito.

### 6.1 Preparar o fork e a branch

```bash
# Fork pelo GitHub e clone do SEU fork
git clone https://github.com/<seu-usuario>/meunegocio360.git
cd meunegocio360
git remote add upstream https://github.com/alexandresjunior/meunegocio360.git

# Antes de começar cada requisito: atualizar a main do fork
git fetch upstream
git switch main
git merge --ff-only upstream/main
git push origin main

# Criar a branch do requisito
git switch -c feat/rf-be-001-login
```

### 6.2 Fluxo de desenvolvimento assistido por IA

| Etapa | O que fazer |
| --- | --- |
| **1. Requisitos** | Leia por inteiro o requisito em [`docs/requisitos/`](./docs/requisitos) (regras, contrato, critérios de aceite, pontos de atenção e dependências introduzidas). Se o requisito ainda não existe, escreva-o com o [template](./docs/requisitos/GERAIS.md#22-template-de-requisito) e peça à IA que aponte ambiguidades e lacunas **antes** de codar. Dúvidas viram perguntas, não suposições. |
| **2. Geração de código** | Peça à IA um plano em passos pequenos e verificáveis, revise-o e implemente em incrementos pequenos, com commits frequentes. Dê à IA o contexto necessário: o requisito, os RNFs aplicáveis e o [`AGENTS.md`](./AGENTS.md), que traz as regras de uso de IA no projeto. Faça só o que o requisito pede. |
| **3. Testes** | Valide cada critério de aceite do requisito. Veja a observação abaixo. |
| **4. Revisão** | Revise linha a linha o que a IA gerou (você responde pelo código), usando a lista de "pontos de atenção" do requisito. Antes de abrir o PR, execute localmente as verificações de qualidade (`uv run ruff format --check && uv run ruff check`; `npm run lint && npm run build`). Abra o PR do seu fork para a `main` do repositório principal e atenda aos comentários da revisão. |
| **5. Deploy** | Publique a branch do seu fork nas suas próprias contas do Netlify e do Render para validar o requisito em um ambiente real (ver [Implantação](#7-implantação)). O deploy do ambiente oficial é feito somente a partir da `main` do repositório principal, após o merge. |

> **Observação sobre a etapa de testes:** a fase de testes automatizados será realizada posteriormente, no módulo de Testes do curso. Até lá, cada critério de aceite do requisito é verificado manualmente (Swagger UI e navegador) e o resultado é registrado na descrição do PR. As seções "Testes previstos" dos requisitos descrevem o que será automatizado nessa fase.

### 6.3 Convenções

**Branches.** Uma branch curta por requisito, criada a partir da `main` atualizada: `<tipo>/<id-do-requisito>-<resumo>`, por exemplo `feat/rf-be-001-login`, `fix/rf-fe-001-redirecionamento`. A `main` é protegida: nada é enviado diretamente a ela.

**Commits.** [Conventional Commits](https://www.conventionalcommits.org/pt-br) (`feat`, `fix`, `docs`, `refactor`, `test`, `chore`), citando o ID do requisito: `feat(auth): autentica usuário por e-mail e senha [RF-BE-001]`. Nunca versione `.env`, `.venv/`, `__pycache__/` nem `node_modules/`.

**Pull requests.** Pequenos e focados em um único requisito. A descrição DEVE informar: o que foi feito e por quê; como foi verificado (critérios de aceite); e o **registro de uso de IA**, com o que foi aceito, ajustado ou rejeitado e por quê. O merge (*squash*) só ocorre **após a aprovação do líder técnico** no GitHub.

**Definição de Pronto.** Marque todos os itens no PR:

- [ ] Todos os critérios de aceite do requisito foram verificados.
- [ ] `uv run ruff format --check && uv run ruff check` e/ou `npm run lint && npm run build` passam localmente.
- [ ] Nenhum segredo, dado pessoal real ou código morto no *diff*.
- [ ] OpenAPI coerente com a implementação (quando há mudança de API).
- [ ] Acessibilidade verificada (quando há mudança de interface).
- [ ] Este README, a documentação e, se aplicável, um ADR foram atualizados.
- [ ] O código gerado por IA foi revisado linha a linha e o registro de uso de IA está no PR.
- [ ] O requisito foi validado no ambiente publicado a partir do fork.

## 7. Implantação

```
Navegador ──► Netlify (SPA estática + repasse de /api/*) ──► Render (backend em Docker) ──► PostgreSQL (Render)
```

Os requisitos de implantação estão em [RNF-100 a RNF-105](./docs/requisitos/GERAIS.md#311-implantação). Para o ambiente próprio do seu fork, crie os serviços abaixo apontando para o **seu fork** e a branch do requisito.

### 7.1 Backend no Render

O backend é implantado como **Docker**, com a mesma imagem usada no `compose.yaml` ([RNF-100](./docs/requisitos/GERAIS.md#311-implantação)), definida em [`meunegocio360-core/Dockerfile`](./meunegocio360-core/Dockerfile). O contêiner aplica as migrations pendentes antes de iniciar a aplicação.

No painel do Render, crie um **Web Service** com *Language* `Docker`, *Root Directory* `meunegocio360-core` e *Health Check Path* `/actuator/health`. O Render informa a porta pela variável `PORT` (a aplicação deve usá-la, [RNF-101](./docs/requisitos/GERAIS.md#311-implantação)). Em *Environment*, configure as mesmas variáveis do [`.env.example`](./.env.example), com estes valores específicos de produção:

| Variável | Valor em produção |
| --- | --- |
| `APP_ENV` | `prod` |
| `CORS_ALLOWED_ORIGINS` | URL do site no Netlify (ex.: `https://meunegocio360.netlify.app`) |
| `APP_AUTH_COOKIE_SECURE` | `true` |
| `DB_URL`, `DB_USER`, `DB_PASSWORD` | Dados do banco de produção (ver abaixo) |
| `JWT_SECRET` | Segredo novo e exclusivo de produção (`openssl rand -base64 48`) |

As variáveis do seed de desenvolvimento (`SEED_*`) NÃO são configuradas em produção.

**Banco de dados.** Crie um **PostgreSQL** gerenciado no próprio Render, na mesma região do Web Service. Use os dados da conexão **interna** (*Internal Database URL*) para preencher `DB_URL` (no formato `postgresql+psycopg://<host>:<porta>/<banco>`), `DB_USER` e `DB_PASSWORD`. O plano gratuito do banco tem limitações de capacidade e de duração; consulte a documentação do Render antes de usá-lo para algo além de validação.

### 7.2 Frontend no Netlify

No Netlify, importe o repositório (seu fork) e configure *Base directory* `meunegocio360-js`. Crie o arquivo `meunegocio360-js/netlify.toml`, substituindo o endereço do backend:

```toml
[build]
  command = "npm run build"
  publish = "dist"

# Repasse da API para o backend: o navegador continua falando com a mesma origem
[[redirects]]
  from = "/api/*"
  to = "https://<seu-servico>.onrender.com/api/:splat"
  status = 200
  force = true

# Fallback das rotas da SPA
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

Em *Environment variables*, defina `VITE_API_BASE_URL=/api/v1`.

### 7.3 Verificações no primeiro deploy

1. `https://<seu-servico>.onrender.com/actuator/health` responde `UP`.
2. O login pelo site do Netlify funciona e, em *DevTools → Application → Cookies*, o cookie de refresh é gravado para o domínio do **Netlify**, com `HttpOnly`, `Secure` e `SameSite=Strict`. A documentação do Netlify não detalha o repasse de `Set-Cookie` em *rewrites*; se o cookie não for gravado, use um domínio próprio com subdomínios do mesmo site (por exemplo, `app.` e `api.`), mantendo `SameSite=Strict`.
3. Recarregar a página mantém a sessão (restauração por refresh token).

### 7.4 Limitações do plano gratuito e *rollback*

- Um *Web Service* gratuito do Render é suspenso após 15 minutos sem tráfego e leva cerca de 1 minuto para voltar. O repasse do Netlify tem limite de 26 segundos por requisição, então a **primeira requisição após a suspensão pode falhar**. O frontend trata isso com a tela de "Tentar novamente" na restauração de sessão ([RF-FE-001](./docs/requisitos/frontend/RF-FE-001.md)); a segunda tentativa encontra o serviço ativo. Para uso contínuo, utilize uma instância paga.
- Para desfazer um deploy com problema, reimplante um deploy anterior pelos painéis do Render e do Netlify. Migrations já aplicadas não são desfeitas pelo *rollback*: mantenha-as compatíveis com a versão anterior do código.

## 8. Documentação

| Documento | Conteúdo |
| --- | --- |
| [`docs/requisitos/GERAIS.md`](./docs/requisitos/GERAIS.md) | Requisitos não funcionais válidos para todo o projeto, índice de requisitos funcionais, template de requisito e branch por requisito. |
| [`docs/requisitos/backend/`](./docs/requisitos/backend) | Um arquivo por requisito funcional do backend (`RF-BE-NNN.md`) e os não funcionais da camada ([`RNF-BE.md`](./docs/requisitos/backend/RNF-BE.md)). |
| [`docs/requisitos/frontend/`](./docs/requisitos/frontend) | Um arquivo por requisito funcional do frontend (`RF-FE-NNN.md`) e os não funcionais da camada ([`RNF-FE.md`](./docs/requisitos/frontend/RNF-FE.md)). |
| [`AGENTS.md`](./AGENTS.md) | Instruções para assistentes de IA que trabalham no repositório. |
