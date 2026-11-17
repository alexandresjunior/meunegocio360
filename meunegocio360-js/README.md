# Frontend MeuNegocio360

Frontend React com Vite. A tela de login, a restauração de sessão e a página inicial protegida seguem o [RF-FE-001](../docs/requisitos-fe.md#rf-fe-001--fluxo-de-login-do-usuário).

## Desenvolvimento local

Na raiz do repositório, inicie o banco e o backend conforme o [README principal](../README.md#5-primeiros-passos). Em seguida, neste diretório:

```powershell
npm install
npm run dev
```

O Vite encaminha `/api` para `http://localhost:8080`. A URL base do frontend deve permanecer relativa (`VITE_API_BASE_URL=/api/v1`); consulte [`.env.example`](./.env.example). Não coloque segredos em variáveis `VITE_*`.

O arquivo `public/_redirects` permite abrir diretamente as rotas da SPA em hospedagem estática. Em produção, configure também o repasse de `/api/*` para a URL do serviço Render, conforme a [seção de implantação](../README.md#72-frontend-no-netlify).

## Comandos

```powershell
npm run lint
npm run format
npm run build
```
