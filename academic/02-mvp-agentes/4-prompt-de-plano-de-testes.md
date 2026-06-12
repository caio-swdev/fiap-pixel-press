# Plano de testes E2E do MVP PixelPress — atividade-2 (entregável extra)

> Você está operando em **Agent Mode**, com permissão para criar diretórios, escrever arquivos, instalar dependências (devDependencies), criar as telas faltantes descritas na Fase 0.5 e executar comandos.
>
> Atue como um **engenheiro de QA/testes sênior** especializado em NestJS e React, implementando uma **suíte de testes ponta-a-ponta (E2E)** que cubra **todas as features já implementadas** do MVP do **PixelPress** (`src/api/` backend NestJS, `src/web/` frontend React + Vite).
>
> **Ferramenta sugerida:** IDE/plugin de agentes do grupo (ex.: Antigravity, Cursor, Claude Code).

---

## 📌 Contrato vinculante (leia antes de tudo)

A pasta `.ai/` na raiz é a **fonte de verdade** do produto; o prompt `2-prompt-de-implementacao.md` define o backend e seu smoke test. **Esta atividade automatiza a verificação de tudo que foi implementado — sem deixar nenhuma feature de fora.**

Antes de escrever qualquer teste, leia e extraia:

| # | Fonte | O que extrair |
|---|-------|---------------|
| 1 | `.ai/business-rules.md` | RBAC, matriz de permissões, ownership, unicidade, fluxo de denúncia — as **asserções** |
| 2 | `.ai/standards.md` | Envelope de erro `{ error: { code, message, details } }`, paginação (`count`/`next`/`previous`/`results`), códigos HTTP |
| 3 | `src/api/src/**/*.controller.ts` | As **21 rotas reais** (caminhos exatos, papéis, DTOs) — a lista canônica abaixo |
| 4 | `src/web/src/pages` + `src/web/src/api/endpoints.ts` | As telas e ações reais a dirigir no Playwright |

**O que esta entrega é:** automação E2E exaustiva de **todas** as features na camada de API, mais os fluxos de usuário equivalentes na UI. **O que não é:** testes unitários (protótipo — o valor está no E2E ponta-a-ponta).

### Inventário canônico das 21 rotas implementadas (cobrir 100% na Camada A)

| # | Rota | Papel | Feature |
|---|------|-------|---------|
| 1 | `POST /api/v1/auth/register` | público | Cadastro |
| 2 | `POST /api/v1/auth/login` | público | Login (JWT access+refresh) |
| 3 | `POST /api/v1/auth/refresh` | público | Renovar access token |
| 4 | `GET /api/v1/usuarios/me` | autenticado | Ver próprio perfil |
| 5 | `PATCH /api/v1/usuarios/me` | autenticado | Editar próprio perfil |
| 6 | `GET /api/v1/usuarios` | ADMIN | Listar usuários (paginado) |
| 7 | `GET /api/v1/usuarios/:id` | autenticado | Ver usuário por id |
| 8 | `PATCH /api/v1/usuarios/:id/papel` | ADMIN | Atribuir papel |
| 9 | `GET /api/v1/games` | autenticado | Buscar/listar catálogo (RAWG) |
| 10 | `GET /api/v1/games/:slug` | autenticado | Detalhe do jogo |
| 11 | `POST /api/v1/biblioteca` | autenticado | Adicionar à biblioteca |
| 12 | `GET /api/v1/biblioteca/me` | autenticado | Minha biblioteca |
| 13 | `PATCH /api/v1/biblioteca/:id` | dono | Editar status/horas |
| 14 | `DELETE /api/v1/biblioteca/:id` | dono | Remover item |
| 15 | `GET /api/v1/reviews` | autenticado | Listar reviews (públicas) |
| 16 | `POST /api/v1/reviews` | autenticado | Criar review |
| 17 | `PATCH /api/v1/reviews/:id` | dono | Editar review |
| 18 | `DELETE /api/v1/reviews/:id` | dono | Excluir review |
| 19 | `PATCH /api/v1/reviews/:id/hide` | MODERADOR | Ocultar review |
| 20 | `POST /api/v1/reports` | autenticado | Denunciar conteúdo |
| 21 | `GET /api/v1/moderation/reports` | MODERADOR | Listar denúncias pendentes |

> Confirme os caminhos exatos lendo os controllers antes de escrever — se algo divergir desta tabela, **o código vence** e você ajusta o teste (e registra a divergência no relatório).

---

## ⚠️ Invariáveis de teste (determinismo é obrigatório)

| # | Eixo | Regra |
|---|------|-------|
| 1 | **Catálogo RAWG** | `USE_RAWG_MOCK=true` **forçado** na suíte inteira. Testes batem no `MockRawgClient` (fixture local): determinístico, sem rede, sem consumir as ~100 req/dia. **Nenhum** teste chama a RAWG real. |
| 2 | **Banco** | `DATABASE_URL="file:./test.db"` **isolado**, recriado (`db push`) e seedado antes da suíte, descartado depois. **Nunca** toca o `dev.db`. |
| 3 | **Massa de dados** | Vem do seed (4 usuários fixos: `USUARIO`, `MODERADOR`, `ADMIN`, inativo; biblioteca; reviews; 1 denúncia pendente). Testes que precisam de estado novo (ex.: cadastro) criam-no em runtime com dados únicos. |

> O cenário **502 (falha RAWG)** é simulado **sem** rede: um stub que satisfaz a interface `RawgClient` e lança o erro mapeado pelo `ExceptionFilter` para 502.

---

## 🎯 Objetivo

Duas suítes E2E, instaladas, rodando e verdes a partir de clone limpo:

* **Camada A — API E2E (Jest + Supertest):** cobre as **21 rotas** (caminhos felizes + erros: 401/403/409/422/502), envelope de erro, paginação, cache miss→hit, upsert do `Jogo` e a matriz RBAC completa.
* **Camada B — UI E2E (Playwright):** dirige o navegador pelos fluxos de usuário, incluindo a **tela de cadastro** (criada na Fase 0.5), biblioteca, reviews, denúncia, moderação e administração.

Ambas com **mock RAWG forçado** e **`test.db` isolado**.

---

## 🛠️ Plano de execução (ordem obrigatória para o agente)

### Fase 0 — Preparação do ambiente de teste

1. `src/api/` devDependencies: `@nestjs/testing`, `jest`, `ts-jest`, `@types/jest`, `supertest`, `@types/supertest`.
2. `src/web/` devDependency: `@playwright/test`; rode `pnpm exec playwright install chromium`.
3. Crie `src/api/.env.test` (gitignored):
   ```
   DATABASE_URL="file:./test.db"
   JWT_SECRET=test-secret-suficientemente-longo-para-os-testes
   JWT_EXPIRATION=3600s
   JWT_REFRESH_EXPIRATION=7d
   RAWG_API_KEY=mock-key-nao-usada
   RAWG_BASE_URL=https://api.rawg.io/api
   RAWG_CACHE_TTL_SECONDS=300
   USE_RAWG_MOCK=true
   ```

### Fase 0.5 — Telas faltantes (pré-requisito do fluxo de cadastro)

> O backend já expõe `POST /auth/register`, mas **o frontend não tem tela de cadastro**. Para testar o fluxo de registro ponta-a-ponta na UI, crie o mínimo necessário, **seguindo o padrão visual e de código das telas existentes** (`LoginPage`, mesmos componentes de UI, `react-hook-form` + `zod`):

4. Adicione `registrarUsuario(payload)` em `src/web/src/api/endpoints.ts` chamando `POST /auth/register`.
5. Crie `src/web/src/pages/RegisterPage.tsx` (nome, email, senha) que registra e, em sucesso, faz login e redireciona para `/catalogo` (espelhe o comportamento do `LoginPage`).
6. Adicione a rota pública `/cadastro` em `App.tsx` e um link "Criar conta" no `LoginPage` (e vice-versa). **Não** altere nenhuma outra tela nem comportamento existente.
7. Garanta `pnpm --filter @pixelpress/web build` verde antes de seguir.

### Fase 1 — Camada A: API E2E (Jest + Supertest)

8. Crie `src/api/test/jest-e2e.json` (preset `ts-jest`, `rootDir: test/`, `testRegex: .e2e-spec.ts$`, carregando `.env.test`).
9. Helper `test/utils/app.ts`: carrega `.env.test`, força `USE_RAWG_MOCK=true` e `test.db`, recria+seed o banco, inicializa a app Nest **com a config do `main.ts`** (prefixo `/api/v1`, `ValidationPipe`, `ExceptionFilter`). Expõe `init()`/`close()`.
10. Helper `test/utils/auth.ts`: login dos 4 usuários do seed → tokens por papel (`usuario`, `moderador`, `admin`).
11. Escreva os specs cobrindo as **21 rotas**, agrupados por módulo:

    **`auth.e2e-spec.ts`** (rotas 1–3)
    | # | Caso | Esperado |
    |---|------|----------|
    | 1 | register email novo | 200 + usuário criado |
    | 2 | login com as credenciais recém-criadas | 200 + JWT |
    | 3 | register email duplicado | 409 |
    | 4 | register payload inválido (email/senha) | 422 |
    | 5 | login credencial errada | 401 |
    | 6 | refresh com refresh token válido | 200 + novo access |
    | 7 | refresh inválido/ausente | 401 |
    | 8 | escrita sem `Authorization` | 401 |

    **`usuarios.e2e-spec.ts`** (rotas 4–8)
    | # | Caso | Esperado |
    |---|------|----------|
    | 1 | `GET /me` logado | 200 + perfil do token |
    | 2 | `PATCH /me` edita nome | 200 + persistido (GET confirma) |
    | 3 | `GET /usuarios` como ADMIN | 200 + lista paginada (`count`/`results`) |
    | 4 | `GET /usuarios` como USUARIO | 403 |
    | 5 | `GET /usuarios/:id` | 200 (ou 403 conforme guard real) |
    | 6 | `PATCH /:id/papel` ADMIN → muda papel | 200 + papel realmente alterado (GET confirma) |
    | 7 | `PATCH /:id/papel` como USUARIO | 403 |

    **`catalogo.e2e-spec.ts`** (rotas 9–10)
    | # | Caso | Esperado |
    |---|------|----------|
    | 1 | `GET /games?search=` | 200 do mock, envelope `count/next/previous/results` |
    | 2 | mesma busca 2ª vez (cache) | **spy**: `RawgClient` chamado só 1×; 2ª servida do cache |
    | 3 | `GET /games/:slug` | 200 + detalhe do mock |
    | 4 | após buscar/abrir um jogo | referência mínima `Jogo` **persistida** (rawgId, slug, nome, capaUrl) via upsert |
    | 5 | client falhando (stub lança) | **502** no envelope; `RAWG_API_KEY` nunca aparece no corpo |

    **`biblioteca.e2e-spec.ts`** (rotas 11–14)
    | # | Caso | Esperado |
    |---|------|----------|
    | 1 | `POST /biblioteca` | 201/200 + item criado |
    | 2 | `GET /biblioteca/me` | 200 + só itens do usuário |
    | 3 | `PATCH /:id` dono edita status/horas | 200 + persistido |
    | 4 | `PATCH /:id` outro usuário | 403 (ownership) |
    | 5 | `DELETE /:id` dono | 200/204 + some da lista |
    | 6 | `DELETE /:id` outro usuário | 403 |
    | 7 | mesmo jogo 2× | 409 (unicidade `usuarioId,jogoId`) |
    | 8 | status inválido (`@IsEnum`) | 422 |

    **`reviews.e2e-spec.ts`** (rotas 15–18)
    | # | Caso | Esperado |
    |---|------|----------|
    | 1 | `GET /reviews` | 200 + paginado; ocultas não aparecem |
    | 2 | `POST /reviews` nota válida (0–10) | 201 + persistida |
    | 3 | `POST /reviews` nota 11 | 422 |
    | 4 | mesma `(usuario,jogo)` 2× | 409 (unicidade) |
    | 5 | `PATCH /:id` dono | 200 + editada |
    | 6 | `PATCH /:id` outro usuário | 403 |
    | 7 | `DELETE /:id` dono | 200/204 |
    | 8 | `DELETE /:id` outro usuário | 403 |

    **`moderacao.e2e-spec.ts`** (rotas 19–21) — fluxo completo
    | # | Caso | Esperado |
    |---|------|----------|
    | 1 | `POST /reports` (usuário denuncia review) | 201 + denúncia `PENDENTE` |
    | 2 | `GET /moderation/reports` como MODERADOR | 200 + lista com a pendente |
    | 3 | `GET /moderation/reports` como USUARIO | 403 |
    | 4 | `PATCH /reviews/:id/hide` MODERADOR | 200 + `oculto:true`, denúncia → `RESOLVIDA` |
    | 5 | review oculta some do `GET /reviews` público | confirmado |
    | 6 | `PATCH /reviews/:id/hide` como USUARIO | 403 |

    **`rbac.e2e-spec.ts`** — matriz consolidada papel × rota protegida (`USUARIO`/`MODERADOR`/`ADMIN`), conforme `business-rules.md` (`ADMIN ⊇ MODERADOR ⊇ USUARIO`).

12. Em **todo** caminho de falha asserte o envelope `{ error: { code, message, details } }` + o código HTTP exato.
13. Suíte verde: `pnpm --filter @pixelpress/api test:e2e`.

### Fase 2 — Camada B: UI E2E (Playwright)

14. `src/web/playwright.config.ts` com `webServer` subindo a stack de teste: API (`.env.test`, mock, `test.db` resetado) + web (`VITE_API_BASE_URL` → API de teste); `baseURL` = web.
15. Specs em `src/web/e2e/`, cobrindo os fluxos das telas reais (`/`, `/cadastro`, `/login`, `/catalogo`, `/jogo/:slug`, `/biblioteca`, `/moderacao`, `/admin/usuarios`):

    | # | Spec | Fluxo |
    |---|------|-------|
    | 1 | `cadastro.e2e.ts` | `/login` → "Criar conta" → `/cadastro` → registrar (email único) → autenticado em `/catalogo` |
    | 2 | `login.e2e.ts` | landing `/` → `/login` → login com seed → `/catalogo` |
    | 3 | `catalogo.e2e.ts` | buscar no `/catalogo` → abrir `/jogo/:slug` → ver detalhe |
    | 4 | `biblioteca.e2e.ts` | adicionar pelo detalhe → ver em `/biblioteca` → **editar status/horas** → **remover** |
    | 5 | `reviews.e2e.ts` | no detalhe: **criar** review → aparece → **editar** → **excluir** |
    | 6 | `denuncia.e2e.ts` | no detalhe, **denunciar** uma review (gera pendente) |
    | 7 | `moderacao.e2e.ts` | como MODERADOR: `/moderacao` lista pendente → **ocultar** → review some |
    | 8 | `admin.e2e.ts` | como ADMIN: `/admin/usuarios` lista → **atribuir papel** → reflete na lista |
    | 9 | `guards.e2e.ts` | como USUARIO: acessar `/moderacao` e `/admin/usuarios` → bloqueado/redirecionado |

16. Seletores estáveis (`getByRole`/`getByText`; se faltar âncora, adicione `data-testid` inertes, sem mudar comportamento). Asserte o resultado visível ao usuário.
17. Suíte verde: `pnpm --filter @pixelpress/web test:e2e:ui`.

### Fase 3 — Scripts e orquestração

18. Scripts:
    * `src/api/package.json` → `"test:e2e": "jest --config test/jest-e2e.json --runInBand"`.
    * `src/web/package.json` → `"test:e2e:ui": "playwright test"`.
    * `package.json` (root) → `"test:all": "pnpm --filter @pixelpress/api test:e2e && pnpm --filter @pixelpress/web test:e2e:ui"`.
19. `--runInBand` na API (SQLite único); reset do `test.db` no início de cada run.

### Fase 4 — Verificação e relatório

20. Rode `pnpm test:all` de um estado limpo e **cole a saída** no relatório.
21. Produza a tabela pass/fail mapeada às **21 rotas** (API) e aos **9 fluxos** (UI).

---

## ✅ Definition of Done (critérios verificáveis)

De um clone limpo, **sem Docker e sem internet**:

```bash
pnpm install
pnpm --filter @pixelpress/web exec playwright install chromium
pnpm test:all
```

* Camada A: as **21 rotas** cobertas (felizes + 401/403/409/422/502), incluindo cache miss→hit, upsert do `Jogo`, paginação e a matriz RBAC; todo erro validando o envelope.
* Camada B: os **9 fluxos** de UI passam, incluindo cadastro (tela nova), CRUD de biblioteca e review, denúncia, moderação, admin e guards de rota.
* Nenhuma chamada à RAWG real; nenhuma escrita no `dev.db`.

---

## ⚠️ Regras finais para o agente

* **Mock RAWG forçado** em 100% da suíte. Teste que tentar rede está errado.
* **`test.db` isolado**, resetado por run, nunca o `dev.db`.
* Sem testes unitários: foco E2E. Cada spec prova um comportamento observável.
* A Fase 0.5 é a **única** mudança permitida em código de produto (tela de cadastro + client + rota/links). Não altere nenhuma outra tela ou comportamento.
* Asserte o **envelope de erro e o código HTTP exatos** de `standards.md` em todo caminho de falha.
* Commits pequenos por fase (`feat(web): cadastro`, `test(api):`, `test(web):`).

---

## 📤 Entregável final (o agente deve produzir)

1. **Fase 0.5** — `RegisterPage` + rota `/cadastro` + `registrarUsuario` no client + links, build verde.
2. **Camada A** — `src/api/test/` com `jest-e2e.json`, helpers e os specs das 21 rotas; script `test:e2e`.
3. **Camada B** — `src/web/e2e/` com `playwright.config.ts` e os 9 specs de fluxo; script `test:e2e:ui`.
4. Script `test:all` no root e `.env.test` (gitignored).
5. **Relatório** em texto contendo:
   * Tabela pass/fail das 21 rotas (API) + 9 fluxos (UI), com a saída real de `pnpm test:all`.
   * Decisões de teste (502 simulado, cache hit asserido, upsert verificado, seletores de UI).
   * Qualquer divergência entre o inventário de 21 rotas e o código real.
   * Dificuldades com o agente escolhido (para a apresentação do dia 17/06).
6. Em seguida, **aguarde mais instruções**.
