# MeuNegocio360 — frontend

Frontend do MeuNegocio360 em React 19, Vite e Bootstrap 5.

As funcionalidades de login, empresa e clientes estão especificadas em [RF-FE-001](../docs/requisitos/frontend/RF-FE-001.md), [RF-FE-002](../docs/requisitos/frontend/RF-FE-002.md) e [RF-FE-003](../docs/requisitos/frontend/RF-FE-003.md). Os padrões visuais e técnicos estão em [RNF-FE.md](../docs/requisitos/frontend/RNF-FE.md).

## Desenvolvimento local

Na raiz do repositório, configure as variáveis conforme `.env.example` e inicie o backend Núcleo. Em seguida:

```powershell
cd meunegocio360-js
npm install
npm run dev
```

O Vite encaminha `/api` para `http://localhost:8080`; o frontend usa a URL relativa `/api/v1` para manter as chamadas na mesma origem. Variáveis `VITE_*` são públicas e não podem conter segredos.

O módulo de clientes está disponível em `/clientes` para os perfis `ADMIN` e `OPERADOR_COMERCIAL`. A rota de apoio do seletor `/dev/cliente-select` é registrada somente no modo de desenvolvimento.

## Comandos

```powershell
npm run lint
npm run format
npm run build
```

Os requisitos gerais do projeto estão em [GERAIS.md](../docs/requisitos/GERAIS.md).
