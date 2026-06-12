# 🎮 PixelPress

Plataforma de gerenciamento e descoberta de jogos utilizando a API da RAWG.io como fonte principal de dados.

> **MVP executável — monorepo pnpm.** Todo o código vive em [`src/`](./src): `src/api` (backend NestJS)
> e `src/web` (frontend React/Vite). Documentação e relatórios em [`docs/`](./docs).
> Guia de execução abaixo. Relatório da entrega em [`docs/RELATORIO-MVP.md`](./docs/RELATORIO-MVP.md).

---

# 🗂️ Estrutura

```
fiap-pixel-press/
├── src/                  # workspace pnpm (todo o código)
│   ├── api/              # backend NestJS + Prisma (SQLite)
│   ├── web/              # frontend React + Vite + Tailwind
│   ├── package.json      # raiz do workspace (scripts dev:api / dev:web)
│   └── pnpm-workspace.yaml
└── docs/                 # arquitetura, relatórios, prompts de agentes
```

---

# 🚀 Rodar o projeto

Demo de baixa infraestrutura: **sem Docker**. Banco **SQLite em arquivo** e **cache in-process**
(desvios conscientes de `docs/context/`, ver relatório). O catálogo é a **RAWG real**.

## Pré-requisitos

- **Node.js ≥ 20** (testado em v22) e **pnpm** (`npm i -g pnpm`)
- Uma **chave RAWG** gratuita (catálogo real) — opcional se rodar em modo mock

### Como obter a chave RAWG

1. Crie conta em <https://rawg.io/login>
2. Em <https://rawg.io/apidocs> gere sua **API key** (plano gratuito: 100 req/dia)
3. Cole em `RAWG_API_KEY` no `src/api/.env`

## Passo a passo

Todos os comandos rodam a partir de **`src/`** (raiz do workspace):

```bash
cd src
cp api/.env.example api/.env   # preencha RAWG_API_KEY (DATABASE_URL já vem default)
pnpm install                   # instala api + web (um único lockfile)
pnpm db:reset                  # cria api/prisma/dev.db, aplica o schema e roda o seed

# em dois terminais (ou use o & no fim):
pnpm dev:api                   # sobe a API   → http://localhost:3000
pnpm dev:web                   # sobe a SPA   → http://localhost:5173
```

- **App (SPA):** <http://localhost:5173/> ← abra aqui (faz proxy de `/api` → backend)
- API: <http://localhost:3000/api/v1>
- Swagger: <http://localhost:3000/api/docs>

> O `dev:api` (`start:dev`) roda `prisma generate && prisma db push && prisma db seed` no prestart,
> garantindo banco populado a cada boot. O `dev.db` é **efêmero** (gitignored) e recriado via
> `db:reset`; toda a massa de demo vem do **seed**.
>
> **Portas:** API default `3000`, SPA `5173`. Conflito (em WSL2 o lado Windows pode reservar a 3000)?
> Suba a API noutra porta e aponte o proxy do Vite para ela:
> ```bash
> PORT=3001 pnpm dev:api
> VITE_PROXY_TARGET=http://localhost:3001 pnpm dev:web
> ```

## Catálogo real vs. fallback offline

Padrão: **RAWG real** (`USE_RAWG_MOCK=false`). Toda leitura de catálogo passa por **cache-aside
in-process** (TTL `RAWG_CACHE_TTL_SECONDS`) antes de chamar a RAWG, respeitando o rate limit.

Demo **offline** (sem internet/chave): no `.env`, `USE_RAWG_MOCK=true`. O `MockRawgClient` serve a
fixture local `src/api/src/jogos/rawg/jogos.fixture.json` (~12 jogos reais da RAWG).

## Credenciais do seed

Todas com a senha de demo **`Senha@123`**:

| # | E-mail | Papel | Observação |
|---|--------|-------|------------|
| 1 | `admin@pixelpress.dev` | ADMIN | Atribui papéis, herda tudo |
| 2 | `moderador@pixelpress.dev` | MODERADOR | Modera/oculta conteúdo |
| 3 | `usuario@pixelpress.dev` | USUARIO | Biblioteca + reviews próprios |
| 4 | `inativo@pixelpress.dev` | USUARIO | `ativo=false` → login negado (401) |

Seed cria ainda 4 jogos, 2 itens de biblioteca, 2 reviews e **1 denúncia pendente**.

## Endpoints (`/api/v1`)

| # | Método | Rota | Auth |
|---|--------|------|------|
| 1 | POST | `/auth/register` · `/auth/login` · `/auth/refresh` | público |
| 2 | GET | `/games?search=` · `/games/:slug` | público (RAWG real) |
| 3 | GET/PATCH | `/usuarios/me` · `/usuarios/:id` | JWT |
| 4 | GET/PATCH | `/usuarios` · `/usuarios/:id/papel` | Admin |
| 5 | POST/GET/PATCH/DELETE | `/biblioteca` · `/biblioteca/me` · `/biblioteca/:id` | JWT (ownership) |
| 6 | GET/POST/PATCH/DELETE | `/reviews` · `/reviews/:id` | público (GET) / JWT |
| 7 | PATCH | `/reviews/:id/hide` | Moderador+ |
| 8 | POST | `/reports` | JWT |
| 9 | GET | `/moderation/reports?status=PENDENTE` | Moderador+ |

Erros no envelope `{ "error": { "code", "message", "details" } }`. Módulos `listas/`, `social/`,
`wishlist/` ficam declarados mas vazios (fora do MVP).

## Scripts (a partir de `src/`)

| # | Script | Ação |
|---|--------|------|
| 1 | `pnpm dev:api` | Sobe a API em watch (db+seed no prestart) → :3000 |
| 2 | `pnpm dev:web` | Sobe a SPA em watch (Vite) → :5173 |
| 3 | `pnpm build` | Compila api + web (`-r build`) |
| 4 | `pnpm db:reset` | Apaga `dev.db`, recria o schema e roda o seed |
| 5 | `pnpm db:seed` | Roda o seed (idempotente) |

---

# 📚 Documentação de domínio

A pasta [`docs/context/`](./docs/context) é a fonte de verdade técnica (standards, architecture,
tech-stack, business-rules). Os documentos originais de domínio:

* [01. Funcionalidades Principais](./docs/01-arquitetura/01-funcionalidades-principais.md)
* [02. Tipos de Usuários e Permissões](./docs/01-arquitetura/02-usuarios-permissoes.md)
* [03. Diagrama de Arquitetura (Camadas)](./docs/01-arquitetura/03-arquitetura-camadas.md)
* [04. Entidades Principais e Relacionamentos](./docs/01-arquitetura/04-entidades-relacionamentos.md)
* [05. Endpoints da API (Rotas REST)](./docs/01-arquitetura/05-endpoints-api.md)
* [06. Tecnologias Sugeridas](./docs/01-arquitetura/06-tecnologias.md)
* [07. Fluxos Principais](./docs/01-arquitetura/07-fluxos-principais.md)

---

# 📖 Sobre o Projeto

O **PixelPress** é um sistema focado em descoberta, organização e interação social relacionada a jogos digitais.

A aplicação utiliza a API da RAWG.io para obtenção de informações sobre jogos, enquanto mantém uma camada própria de backend responsável por funcionalidades sociais, bibliotecas pessoais, reviews, recomendações e gerenciamento de usuários.

---

# 🧩 Principais Funcionalidades

* Busca avançada de jogos
* Página de detalhes do jogo
* Biblioteca pessoal
* Sistema de avaliações e reviews
* Listas customizadas
* Recomendações personalizadas
* Feed de lançamentos
* Perfil público com estatísticas
* Sistema social (follow + atividades)
* Wishlist com alertas de lançamento
