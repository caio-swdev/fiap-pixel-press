# Implementação do MVP frontend do PixelPress, atividade-2 (camada de apresentação)

> Você está operando em **Agent Mode**, com permissão para criar diretórios, escrever arquivos, instalar dependências e executar comandos.
>
> Atue como um **engenheiro de software sênior Frontend React/TypeScript**, implementando a SPA do **PixelPress** que consome o backend já entregue (`/api/v1`).
>
> **Ferramenta sugerida:** IDE/plugin de agentes do grupo (ex.: Antigravity, Cursor, Claude Code).

---

## 📌 Contrato vinculante (leia antes de tudo)

Este prompt complementa o `2-prompt-de-implementacao.md` (backend). O **backend já está implementado e rodando** na raiz do repositório (`src/`, Prisma SQLite, RAWG real/mock). O frontend **não reimplementa regra de negócio**: ele consome a API e reflete na UI as permissões e validações que o backend já impõe.

Fontes de verdade, na ordem de precedência:

| # | Fonte | O que define |
|---|-------|--------------|
| 1 | `.ai/architecture.md` | Camadas: a SPA é a camada de apresentação, fala **só** com a API REST via HTTPS/JSON+JWT, nunca acessa banco nem a RAWG diretamente |
| 2 | `.ai/business-rules.md` | RBAC (matriz de permissões), ownership, fluxo de denúncia, status de biblioteca, faixa de nota. A UI espelha isso (mostra/esconde ações por papel) |
| 3 | `1-Arquitetura/06-tecnologias.md` | Stack de frontend aprovada (ver desvio 1 abaixo) |
| 4 | Contrato HTTP vivo do backend | `/api/v1` em execução e o OpenAPI em `/api/docs` (JSON em `/api/docs-json`). É a especificação literal de rotas, payloads e envelope de erro |

Regras inegociáveis:

* A SPA **só** conversa com `http://<host>/api/v1`. **Nunca** chama a RAWG diretamente, **nunca** acessa banco. A `RAWG_API_KEY` jamais aparece no frontend (nem em `.env`, nem em código, nem em request).
* **TypeScript com `strict: true`, sem `any` explícito.** Use `unknown` + narrowing quando o tipo for incerto.
* **Componentes finos e burros na borda; lógica de dados em hooks.** Nada de `fetch` solto dentro de componente de tela: toda I/O passa por uma camada de dados (hooks de query/mutation).
* O **envelope de erro do backend** (`{ "error": { "code", "message", "details" } }`) é tratado de forma central (interceptor + toast), nunca com `try/catch` espalhado por tela.
* O **contrato de paginação** (`count`, `next`, `previous`, `results`) é respeitado em todas as listas.
* **RBAC na UI é cosmético, não é segurança.** Esconder/desabilitar botões por papel melhora UX, mas a autorização real é do backend. Nunca assuma que esconder o botão protege o recurso.
* **Nomenclatura de domínio em português**, consistente com o backend (`Usuario`, `Jogo`, `ItemBiblioteca`, `Review`, `Denuncia`, `StatusBiblioteca`, `Papel`).
* Não introduza dependência fora da lista aprovada (seção Stack) sem decisão documentada.

---

## ⚠️ Desvios conscientes (registrar no relatório final)

| # | Situação | Decisão | Justificativa |
|---|----------|---------|---------------|
| 1 | `tech-stack.md` é **backend-only**: não lista dependências de frontend aprovadas | A stack de frontend é puxada de `1-Arquitetura/06-tecnologias.md` (React + TS + Tailwind + shadcn/ui) e formalizada na seção Stack deste prompt | Evita o mesmo gap de rastreabilidade do backend; a fronteira fica declarada explicitamente |
| 2 | Armazenamento do JWT no browser | **`localStorage`** para access + refresh token, apenas nesta demo MVP | Cookie `httpOnly` seria o ideal de produção, mas exige ajuste de CORS/credenciais no backend já entregue. Para a demo de instância única, `localStorage` é aceitável e fica registrado como dívida |
| 3 | Layout do repositório | A SPA vive em **`frontend/`** ao lado de `src/` (backend). pnpm, projetos independentes | Risco zero para o backend já testado. A arquitetura sugere monorepo `frontend`/`backend`; mover o backend para `backend/` fica como evolução futura, fora deste MVP |

Nenhum outro desvio é permitido. Sem mock de API no frontend: a demo consome o backend real (que por sua vez pode estar com `USE_RAWG_MOCK=true` para rodar offline).

---

## 🎯 Objetivo

Entregar uma **SPA executável localmente** que demonstre visualmente o domínio do PixelPress numa apresentação de 3 a 10 minutos, consumindo o backend real: catálogo da RAWG, autenticação JWT, biblioteca, reviews e o fluxo de moderação, com a UI refletindo papéis e ownership.

Materialização:

1. **Login com credenciais do seed** do backend (4 usuários, um por papel). Sessão via JWT, com refresh e logout.
2. **Catálogo real** consumido via `/api/v1/games` (busca paginada) e `/api/v1/games/{slug}` (detalhe rico).
3. **Biblioteca pessoal**: adicionar jogo (a partir do detalhe), trocar status, remover. Ownership refletido na UI.
4. **Reviews**: criar/editar/excluir a própria; listar as públicas de um jogo (as ocultas não aparecem).
5. **Moderação** (Moderador/Admin): listar denúncias pendentes, ocultar review. Denunciar review (qualquer usuário).
6. **RBAC visível**: a UI mostra ou esconde ações conforme o papel do usuário logado, fiel à matriz de `business-rules.md`.
7. **Execução local** com um único `pnpm dev`, apontando para o backend via `VITE_API_BASE_URL`.

---

## 📦 Escopo do MVP (vertical slice, espelha o backend)

| # | Área | Entrega mínima |
|---|------|----------------|
| 1 | Infra/app shell | Vite + React + TS strict, roteamento, layout base (header com usuário/papel + logout), tema Tailwind/shadcn |
| 2 | Camada de dados | Cliente HTTP único (axios) com interceptor de `Authorization: Bearer`, tratamento central do envelope de erro, refresh em 401; hooks via TanStack Query |
| 3 | Tipos | Tipos do domínio derivados do OpenAPI do backend (`/api/docs-json`) ou declarados à mão espelhando os DTOs. Sem `any` |
| 4 | Auth | Tela de login (atalhos para as credenciais do seed), guarda de rota privada, persistência de sessão, logout |
| 5 | Catálogo | Busca com paginação (`page`/`page_size`), grid de cards, tela de detalhe com capa, descrição, metacritic, gêneros, plataformas, screenshots |
| 6 | Biblioteca | Lista "minha biblioteca", adicionar a partir do detalhe (seleção de `StatusBiblioteca`), editar status/horas, remover. Tratar 409 (unicidade) e 403 (ownership) com mensagem clara |
| 7 | Reviews | Criar/editar/excluir a própria review (nota 0 a 10, spoiler, texto); listar reviews públicas por jogo. Surfacing do 422 (nota inválida) e 409 (review duplicada) |
| 8 | Moderação | Botão "denunciar" numa review (usuário registrado); painel de denúncias pendentes e ação "ocultar" (Moderador/Admin); review ocultada some da listagem pública |
| 9 | Admin | Tela mínima de usuários com atribuição de papel (`/usuarios/:id/papel`), visível só para Admin |

**Fora do escopo** (espelha o backend, deixar declarado no relatório, não implementar): `listas`, `social` (follow/feed), `wishlist`. Sem SSR, sem realtime, sem testes obrigatórios nesta fase.

---

## 🧱 Stack aprovada (frontend)

Runtime e build:

| # | Pacote | Finalidade |
|---|--------|------------|
| 1 | `react`, `react-dom` (18.x) | Biblioteca de UI |
| 2 | `typescript` (5.x, `strict`) | Tipagem |
| 3 | `vite` + `@vitejs/plugin-react` | Dev server e build |
| 4 | `react-router-dom` | Roteamento SPA |
| 5 | `@tanstack/react-query` | Data fetching, cache, estados de loading/erro |
| 6 | `axios` | Cliente HTTP (interceptors de auth e erro) |
| 7 | `react-hook-form` + `zod` + `@hookform/resolvers` | Formulários e validação client-side (espelha as regras, não as substitui) |
| 8 | `tailwindcss`, `postcss`, `autoprefixer` | Estilização |
| 9 | `shadcn/ui` (Radix + utilitários) | Componentes de UI (button, input, card, dialog, table, toast, select, badge) |

Dev/codegen (opcional, recomendado):

| # | Pacote | Finalidade |
|---|--------|------------|
| 1 | `openapi-typescript` | Gerar tipos a partir de `/api/docs-json` do backend, garantindo ponta a ponta |

Gerenciador: **pnpm**. Proibido: qualquer cliente HTTP alternativo (`fetch` solto na borda da tela é desencorajado; centralize no axios), libs de estado pesadas desnecessárias (Redux/MobX) para este escopo, e qualquer chamada direta à RAWG.

---

## 🔌 Contrato de integração com o backend

Base URL via env: `VITE_API_BASE_URL` (default `http://localhost:3000/api/v1`).

> Atenção: no ambiente de demo o backend pode subir em outra porta (ex.: `3100`) se a `3000` estiver ocupada. O frontend deve ler a base da env, nunca hardcodar a porta.

Rotas que a SPA consome (todas já existem no backend):

| # | Fluxo | Endpoint |
|---|-------|----------|
| 1 | Login / refresh | `POST /auth/login`, `POST /auth/refresh` |
| 2 | Catálogo | `GET /games?search=&page=&page_size=`, `GET /games/{slug}` |
| 3 | Perfil próprio | `GET /usuarios/me` |
| 4 | Admin usuários | `GET /usuarios`, `PATCH /usuarios/{id}/papel` |
| 5 | Biblioteca | `POST /biblioteca`, `GET /biblioteca/me`, `PATCH /biblioteca/{id}`, `DELETE /biblioteca/{id}` |
| 6 | Reviews | `GET /reviews?jogo={slug}`, `POST /reviews`, `PATCH /reviews/{id}`, `DELETE /reviews/{id}` |
| 7 | Moderação | `POST /reports`, `GET /moderation/reports?status=PENDENTE`, `PATCH /reviews/{id}/hide` |

Convenções a respeitar no cliente:

* Anexar `Authorization: Bearer <access_token>` em toda chamada autenticada.
* Em `401`, tentar `POST /auth/refresh` uma vez; se falhar, limpar sessão e redirecionar ao login.
* Parsear sempre o envelope `{ error: { code, message, details } }` e exibir `message` (e `details` quando houver) num toast. Mapear `code` para mensagens amigáveis quando fizer sentido (ex.: `REVIEW_DUPLICADA`, `ITEM_BIBLIOTECA_DUPLICADO`, `NOTA_INVALIDA`, `OWNERSHIP_NEGADO`).
* Listas seguem `{ count, next, previous, results }`; a paginação da UI usa esses campos.
* `StatusBiblioteca` (`JOGANDO`, `ZERADO`, `QUERO_JOGAR`, `DROPEI`, `PLATINADO`) e `Papel` (`USUARIO`, `MODERADOR`, `ADMIN`) como enums/uniões TS espelhando o backend.

---

## 🛠️ Plano de execução (ordem obrigatória para o agente)

Execute em fases. Ao final de cada fase, garanta que o projeto **compila** (`pnpm build` ou `tsc --noEmit`) antes de avançar.

### Fase 0, Bootstrap
1. Criar `frontend/` com Vite (`react-ts`), pnpm, `tsconfig` com `strict: true`. Configurar Tailwind e inicializar shadcn/ui (button, input, card, dialog, table, toast, select, badge).
2. Criar `.env.example` e `.env` com `VITE_API_BASE_URL`. Não versionar `.env`.
3. Configurar React Router e TanStack Query (QueryClientProvider). App shell com header (nome + papel do usuário + logout) e área de conteúdo.

### Fase 1, Camada de dados e tipos
4. (Recomendado) Com o backend rodando, gerar tipos via `openapi-typescript` a partir de `/api/docs-json`. Alternativa: declarar tipos do domínio à mão.
5. Cliente axios único (`api/http.ts`) com `baseURL` da env, interceptor de Bearer, interceptor de resposta que normaliza o envelope de erro e dispara refresh em 401.
6. Hooks de query/mutation por recurso (`useLogin`, `useGames`, `useGameDetail`, `useMinhaBiblioteca`, `useAddBiblioteca`, `useReviews`, `useCreateReview`, `useReports`, `useHideReview`, etc).

### Fase 2, Auth
7. Contexto de sessão (usuário atual + tokens). Tela de login com atalhos das 4 credenciais do seed. Guarda de rota privada. Logout limpando sessão.

### Fase 3, Catálogo
8. Tela de busca: input de `search`, grid de cards (capa, nome), paginação. Tela de detalhe por `slug` com os campos ricos da RAWG.

### Fase 4, Biblioteca e Reviews
9. Na tela de detalhe: ação "adicionar à biblioteca" (com seletor de status) e bloco de reviews do jogo (listar públicas; criar/editar/excluir a própria). Tela "minha biblioteca" com editar status/horas e remover. Tratar 409, 403, 422 com mensagens claras.

### Fase 5, Moderação e Admin
10. Ação "denunciar" numa review (usuário registrado). Painel de denúncias pendentes e botão "ocultar" (visível a Moderador/Admin). Tela de usuários com atribuição de papel (Admin). Após ocultar, a review some da listagem pública.

### Fase 6, Polimento e demo
11. Estados de loading/erro/vazio em todas as listas. Badges de papel e de status. Garantir que a UI esconde ações sem permissão conforme a matriz de `business-rules.md`.
12. `pnpm build` sem erros e `pnpm dev` servindo a SPA conectada ao backend.

---

## ✅ Definition of Done (espelha o smoke do backend, na UI)

A partir de um clone limpo, com o **backend rodando** (`pnpm start:dev` na raiz) e a SPA apontando para ele:

```bash
cd frontend
cp .env.example .env      # ajuste VITE_API_BASE_URL para a porta do backend
pnpm install
pnpm dev
```

E a UI cumpre:

| # | Cenário | Esperado na tela |
|---|---------|------------------|
| 1 | Login seed | Logar com `usuario@pixelpress.dev` / `Senha@123` entra na app; header mostra nome e papel |
| 2 | Login inativo | `inativo@pixelpress.dev` falha com mensagem de credencial inválida (backend retorna 401) |
| 3 | Catálogo | Buscar "witcher" lista resultados reais; abrir o card mostra o detalhe rico |
| 4 | Biblioteca | Adicionar um jogo à biblioteca aparece em "minha biblioteca" com o status escolhido |
| 5 | Unicidade | Tentar adicionar o mesmo jogo de novo mostra mensagem de duplicado (409) |
| 6 | Review inválida | Enviar review com nota 11 mostra erro de nota inválida (422), sem quebrar a tela |
| 7 | Ownership | Logado como outro usuário, não há ação de editar review/biblioteca de terceiros (e a API barra com 403 se forçado) |
| 8 | Sessão | Recarregar a página mantém a sessão; logout volta ao login; rota privada sem sessão redireciona |
| 9 | RBAC visível | Como `usuario`, o painel de moderação/admin não aparece; como `moderador`, aparece denúncias pendentes |
| 10 | Fluxo de moderação | `moderador` lista denúncias pendentes, oculta a review denunciada, e ela some da listagem pública do jogo |

---

## 📤 Entregável final (o agente deve produzir)

1. SPA React rodando localmente conforme a Definition of Done (um `pnpm dev` + backend ativo).
2. `frontend/README.md` com: passo a passo de execução, variável `VITE_API_BASE_URL`, nota sobre a porta do backend, credenciais do seed e como rodar com o backend em modo `USE_RAWG_MOCK=true` para demo offline.
3. Relatório final em texto contendo:
   * Lista das telas, hooks e componentes criados (e o que ficou fora do MVP: `listas`, `social`, `wishlist`).
   * Os **desvios conscientes** (stack via `06-tecnologias.md`, JWT em `localStorage`, layout `frontend/`) e seu impacto.
   * Resultado dos 10 cenários da Definition of Done.
   * Decisões não explícitas nas fontes (ex.: geração de tipos via OpenAPI, mapa de `code` de erro para mensagens).
   * Dificuldades com o agente escolhido (para os comentários da apresentação).
4. Em seguida, **aguarde mais instruções**.

---

## ⚠️ Regras finais para o agente

* A SPA é camada de apresentação: **não** reimplementa regra de negócio, **não** chama a RAWG, **não** acessa banco. Tudo via `/api/v1`.
* A `RAWG_API_KEY` nunca entra no frontend. Nenhum segredo do backend no bundle.
* RBAC na UI é UX, não segurança: o backend continua sendo a autoridade. Não confie no esconder-botão.
* Não toque no código do backend (`src/`, `prisma/`). Este prompt é aditivo, isolado em `frontend/`.
* Commits pequenos e descritivos por fase. Legibilidade acima de abstração prematura.
