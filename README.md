# CI Pipeline — API REST + Banco de Dados SQL

Aplicação **Tasks API** desenvolvida em **Node.js 20 + TypeScript + Express + SQLite (SQL)** com pipeline automatizado de **Integração Contínua (CI)** no **GitHub Actions**.

## Arquitetura da Aplicação

- **API REST**: Express (`GET /health`, `GET /api/tasks`, `GET /api/tasks/:id`, `POST /api/tasks`, `PUT /api/tasks/:id`, `DELETE /api/tasks/:id`)
- **Banco de Dados SQL**: SQLite (`better-sqlite3`) com tabela `tasks` e queries SQL parametrizadas
- **Testes**:
  - **Unitários** (`tests/unit/taskValidation.test.ts`): validação e mapeamento de dados
  - **Integração** (`tests/integration/tasksApi.test.ts`): testes HTTP completos com `supertest` integrados ao banco SQLite

## Etapas do Workflow CI (`.github/workflows/ci-pipeline.yml`)

Disparado automaticamente em eventos de **Pull Request** (`opened`, `synchronize`, `reopened`) para a branch `main`:

1. **Checkout e setup Node.js 20** (`actions/checkout@v4`, `actions/setup-node@v4`)
2. **Instalação determinística** (`npm ci`)
3. **Análise de formatação** (`npm run format:check` — Prettier)
4. **Análise estática de código** (`npm run lint` — ESLint)
5. **Análise estática de segurança** (`npm run security:check` — `eslint-plugin-security` + `npm audit`)
6. **Build da aplicação** (`npm run build` — `tsc`)
7. **Testes unitários** (`npm run test:unit` — Jest)
8. **Testes de integração** (`npm run test:integration` — Jest + Supertest + SQLite)
9. **Criação de imagem Docker** (`docker/setup-buildx-action@v3` + `docker/build-push-action@v5` com `push: false`)

## Execução Local

```bash
npm ci
npm run format:check
npm run lint
npm run security:check
npm run build
npm run test:unit
npm run test:integration
```
