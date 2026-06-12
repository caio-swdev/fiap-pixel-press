# Implementação do MVP backend do PixelPress — atividade-2

> Você está operando em **Agent Mode**, com permissão para criar diretórios, escrever arquivos, instalar dependências e executar comandos.
>
> Atue como um **engenheiro de software sênior Node.js/NestJS**, implementando o backend do **PixelPress** a partir do contexto técnico já definido na pasta `.ai/`.
>
> **Ferramenta sugerida:** IDE/plugin de agentes do grupo (ex.: Antigravity, Cursor, Claude Code).

---

## 📌 Contrato vinculante (leia antes de tudo)

A pasta `.ai/` na raiz do repositório é a **fonte de verdade** desta implementação. **Leia os quatro arquivos antes de escrever qualquer linha de código** e trate cada regra como obrigatória, **exceto** os desvios conscientes declarados na seção seguinte:

| # | Arquivo | O que define |
|---|---------|--------------|
| 1 | `.ai/standards.md` | Convenções de código, estrutura de módulos, DTOs, paginação, envelope de erro |
| 2 | `.ai/architecture.md` | Camadas, integração RAWG real, cache-aside, JWT, RBAC, seed |
| 3 | `.ai/tech-stack.md` | Versões, dependências aprovadas e **proibidas**, variáveis de ambiente |
| 4 | `.ai/business-rules.md` | RBAC, matriz de permissões, ownership, unicidade, fluxo de denúncia |

Os sete documentos `01-...md` a `07-...md` na raiz são o domínio original e podem ser consultados como referência secundária. Em qualquer conflito **não listado abaixo**, **`.ai/` prevalece**.

Regras inegociáveis que **permanecem** valendo:

* **Catálogo via RAWG API real** (HTTP), encapsulado no módulo `jogos/` pelo `RawgClient` (`@nestjs/axios`). Nenhum outro módulo chama a RAWG diretamente.
* Chave RAWG (`RAWG_API_KEY`) via `.env`; **nunca** exposta em logs, respostas ou código versionado. Em falha da RAWG (timeout, 4xx, 5xx): **502 Bad Gateway** com mensagem padronizada.
* `Jogo` no banco é referência mínima (`rawgId`, `slug`, `nome`, `capaUrl`), criada via upsert no primeiro uso. Detalhes ricos buscados sob demanda, nunca persistidos.
* `TypeScript` com `strict: true`, sem `any` explícito.
* Controllers finos; lógica de negócio só em services; RBAC e ownership em guards/services conforme `standards.md`.
* `PrismaService` é o único acesso ao banco; nunca instanciar `PrismaClient` fora dele.
* Nomenclatura de domínio **em português** (`Usuario`, `Jogo`, `ItemBiblioteca`, `Review`, `Lista`, `Follow`, `ItemWishlist`).
* Envelope de erro, paginação e códigos HTTP exatamente como em `standards.md`.
* Nenhuma dependência da lista **proibida** além da exceção declarada abaixo (`sqlite`). Continuam vetados `typeorm`, `sequelize`, `mongoose`, `node-fetch`, `got`, `undici`, `puppeteer`, `cheerio`, etc.

---

## ⚠️ Desvios conscientes do `.ai/` (decisão de escopo do MVP)

Para esta entrega o grupo optou por uma demo de **baixa infraestrutura** (sem Docker, sem serviços externos além da própria RAWG). Dois pontos do `.ai/` são deliberadamente sobrescritos **apenas neste MVP**, e o agente deve registrá-los no relatório final:

| # | Regra original no `.ai/` | Override no MVP | Justificativa |
|---|--------------------------|-----------------|---------------|
| 1 | PostgreSQL como banco; `sqlite` proibido | **SQLite em arquivo via Prisma** (`provider = "sqlite"`, `DATABASE_URL="file:./dev.db"`), gitignored e recriado/seedado a cada boot | Demo roda com um único `pnpm start:dev`, sem Docker; arquivo local evita os problemas de connection-pool do `:memory:` |
| 2 | Cache-aside em **Redis** (`ioredis`) | **Cache-aside in-process** (serviço com `Map` + TTL, sem dependência nova) | Cumpre o papel do cache do `architecture.md` e protege o rate limit da RAWG, sem subir Redis |

O catálogo **continua sendo a RAWG real** (isto **não** é desvio: é o que o `.ai/` sempre pediu). O Prisma **permanece** como ORM e único acesso ao banco. Só mudam o `provider` do banco e o backend do cache. **Nenhum outro desvio é permitido**: persistência real, JWT real, RBAC real, validações reais.

> Consequência técnica obrigatória: o conector SQLite do Prisma **não suporta `enum`**. Modele `Papel` e `StatusBiblioteca` como `String` no `schema.prisma`, mantendo o **enum TypeScript** como fonte de verdade e validando com `@IsEnum(...)` nos DTOs.

---

## 🎯 Objetivo desta atividade

Entregar um **MVP backend executável localmente** que demonstre o domínio do PixelPress numa apresentação de 3 a 10 minutos, com **catálogo real da RAWG** e **dados de usuário mockados** (seed).

Materialização:

1. **Catálogo real.** O `RawgClient` consome a **RAWG API real** via `@nestjs/axios`, protegido por **cache-aside in-process** (TTL configurável) para respeitar o rate limit de 100 req/dia do plano gratuito.
2. **Fallback offline opcional.** Um `MockRawgClient` (fixture de jogos reais) fica disponível e é injetado quando `USE_RAWG_MOCK=true`. Default é `false` (usa a API real). Serve como rede de segurança caso a internet ou a chave falhe **durante a apresentação ao vivo**.
3. **Banco SQLite em arquivo** (`file:./dev.db`, gitignored) via Prisma, recriado e seedado a cada boot.
4. **Dados de usuário mockados** via `prisma/seed.ts` (4 usuários, um por papel + um inativo, biblioteca, reviews e 1 denúncia pendente).
5. **Execução local** com um único comando após `pnpm install` e uma chave RAWG no `.env`. Sem Docker.

---

## 📦 Escopo do MVP (vertical slice demonstrável)

Implemente um corte vertical coeso que exercite catálogo real, RBAC, ownership e o fluxo de moderação. Módulos **dentro** do MVP:

| # | Módulo | Entrega mínima |
|---|--------|----------------|
| 1 | `config/` | `ConfigModule` global validando as variáveis de `.env` |
| 2 | `common/` | `ValidationPipe`, `ExceptionFilter` global (envelope de erro), `RolesGuard`, `@Roles()`, decorator `@UsuarioAtual()`, helper de paginação, `CacheService` in-process |
| 3 | `auth/` | Registro, login (JWT access + refresh), `JwtStrategy`, hash com `bcrypt` |
| 4 | `usuarios/` | CRUD mínimo de perfil + atribuição de papel (apenas Admin) |
| 5 | `jogos/` | Busca e detalhe via `RawgClient` (RAWG real) + cache-aside in-process + upsert da referência `Jogo` |
| 6 | `biblioteca/` | Adicionar/atualizar/remover `ItemBiblioteca` com status (enum TS), unicidade `(usuarioId, jogoId)`, ownership |
| 7 | `reviews/` | Criar/editar/excluir review (nota 0–10, unicidade, ownership) + rota de moderação `hide` |
| 8 | `moderacao/` | Criar denúncia (`PENDENTE`), listar pendentes (Moderador), ocultar conteúdo (soft-delete `oculto: true`) |

Módulos **fora** do MVP (deixe declarados mas vazios, ou omita, e registre no relatório): `listas/`, `social/`, `wishlist/`. Não os implemente agora; mantenha a estrutura prevista em `standards.md` sem quebrar o build.

---

## 🛠️ Plano de execução (ordem obrigatória para o agente)

Execute em fases. Ao final de cada fase, garanta que o projeto **compila** antes de avançar.

### Fase 0 — Bootstrap

1. Inicialize o projeto NestJS 10 com `pnpm`, `TypeScript strict`, estrutura de pastas exata de `standards.md`.
2. Crie `tsconfig.json` com `strict: true`, `target: ES2022`, `module: commonjs`.
3. Instale as dependências aprovadas em `tech-stack.md`, **com estas diferenças do MVP**:
   * **Remova** `ioredis` (cache passa a ser in-process, sem dependência nova).
   * **Mantenha** `@nestjs/axios` + `axios` (cliente da RAWG real).
   * `prisma`/`@prisma/client` usam o provider **sqlite**.
4. Crie `.env.example` (versionado) e `.env` (não versionado). Variáveis do MVP:
   ```
   DATABASE_URL="file:./dev.db"
   JWT_SECRET=<string longa e aleatória>
   JWT_EXPIRATION=3600s
   JWT_REFRESH_EXPIRATION=7d
   RAWG_API_KEY=<chave real obtida em rawg.io>
   RAWG_BASE_URL=https://api.rawg.io/api
   RAWG_CACHE_TTL_SECONDS=300
   USE_RAWG_MOCK=false
   ```
   Não inclua `REDIS_URL`.
5. **Não** crie `docker-compose.yml`. A demo não usa Docker.

### Fase 1 — Persistência (SQLite em arquivo)

6. Escreva `prisma/schema.prisma` com `provider = "sqlite"`: models `Usuario`, `Jogo`, `ItemBiblioteca`, `Review`, `Denuncia`, com as constraints `@@unique` de `business-rules.md` (`ItemBiblioteca(usuarioId, jogoId)`, `Review(usuarioId, jogoId)`). Campos de papel/status como `String` (SQLite não tem `enum`).
7. Use o script `pnpm prisma db push` para materializar o schema no `dev.db`, e adicione um `pnpm db:reset` (apaga `dev.db`, refaz push e roda o seed). `dev.db` vai no `.gitignore`. Para a demo, o boot deve garantir banco populado: rode `db push` + seed antes de `start:dev` (ou no `prestart`).
8. Implemente `PrismaService` (provider global, conecta no `onModuleInit`).

### Fase 2 — Plataforma transversal (`common/` + `config/`)

9. `main.ts`: `ValidationPipe` global (`whitelist`, `forbidNonWhitelisted`, `transform`), `nestjs-pino`, prefixo `/api/v1`, Swagger em `/api/docs`.
10. `ExceptionFilter` global emitindo o envelope `{ "error": { "code", "message", "details" } }` com os códigos HTTP de `standards.md`.
11. `RolesGuard` + `@Roles()` lendo o papel do JWT; hierarquia `ADMIN ⊇ MODERADOR ⊇ USUARIO`.
12. Helper de paginação (`page`, `page_size`, envelope `count`/`next`/`previous`/`results`) via `skip`/`take` do Prisma.
13. `CacheService` in-process: chave → `{ valor, expiraEm }` num `Map`, com TTL de `RAWG_CACHE_TTL_SECONDS`. Métodos `get`/`set` assíncronos para manter o contrato cache-aside do `architecture.md`. **Exclusivo para respostas da RAWG**; dados de usuário nunca passam por ele.

### Fase 3 — Catálogo via RAWG real (`jogos/`)

14. Defina a interface `RawgClient` (busca, detalhe) no módulo `jogos/`.
15. Implemente **duas** classes que satisfazem o contrato:
    * `HttpRawgClient` — **caminho principal**. Usa `@nestjs/axios`, lê `RAWG_API_KEY` e `RAWG_BASE_URL`, normaliza o payload da RAWG. Em timeout/4xx/5xx, lança erro que o `ExceptionFilter` mapeia para **502**.
    * `MockRawgClient` — **fallback offline**. Serve `jogos.fixture.json` (~12 jogos reais da RAWG: `rawgId`, `slug`, `nome`, `capaUrl` e alguns detalhes ricos).
16. No `JogosModule`, factory provider lê `USE_RAWG_MOCK`: `false` → `HttpRawgClient` (default); `true` → `MockRawgClient`.
17. `JogosService` aplica **cache-aside** via `CacheService` sobre o resultado do client: consulta o cache → hit responde sem chamar a RAWG; miss chama a RAWG, grava no cache com TTL, responde. Faz **upsert** da referência mínima `Jogo` no banco no primeiro uso.

### Fase 4 — Domínio do usuário

18. `auth/`: registro + login emitindo JWT; senha com `bcrypt`; `JwtStrategy` populando `req.user`.
19. `biblioteca/`, `reviews/`, `moderacao/` conforme escopo, com validações de domínio **no service**, nunca no controller: `@IsEnum(StatusBiblioteca)`, nota 0–10 (422), unicidade (409), ownership (403).
20. Fluxo de denúncia completo de `business-rules.md`: criar (`PENDENTE`) → listar pendentes (Moderador) → ocultar (`oculto: true`, `motivoOcultacao`, `ocultadoPorId`, denúncia → `RESOLVIDA`).

### Fase 5 — Seed mockado

21. `prisma/seed.ts` populando: 4 usuários (`USUARIO`, `MODERADOR`, `ADMIN` e um inativo), com senhas conhecidas para a demo; alguns `ItemBiblioteca` e `Review` referenciando `rawgId`s reais da RAWG; e **1 denúncia pendente** para demonstrar moderação. Documente as credenciais no `README`.

### Fase 6 — Verificação e entrega

22. Garanta `pnpm build` sem erros e `pnpm start:dev` subindo a API com o banco já populado.
23. Execute o smoke test abaixo e cole a saída no relatório final.

---

## ✅ Definition of Done (critérios de aceite verificáveis)

O MVP está pronto quando, a partir de um clone limpo, esta sequência funciona **sem Docker** (com internet e uma chave RAWG válida):

```bash
cp .env.example .env          # preencha RAWG_API_KEY; DATABASE_URL="file:./dev.db" já default
pnpm install
pnpm db:reset                 # cria dev.db, aplica o schema e roda o seed
pnpm start:dev
```

E o smoke test passa:

| # | Cenário | Comando / esperado |
|---|---------|--------------------|
| 1 | Health/docs | `GET /api/docs` carrega Swagger |
| 2 | Login seed | `POST /api/v1/auth/login` com credencial do seed → 200 + JWT |
| 3 | Catálogo real (miss → hit) | `GET /api/v1/games?search=zelda` → 200 da RAWG real; segunda chamada idêntica servida do cache in-process (sem nova chamada à RAWG) |
| 4 | Detalhe | `GET /api/v1/games/{slug}` → 200 com detalhes da RAWG |
| 5 | Falha RAWG | com `RAWG_API_KEY` inválida, chamada ao catálogo → **502** no envelope padrão (chave nunca aparece na resposta) |
| 6 | Biblioteca + ownership | usuário adiciona `ItemBiblioteca`; outro usuário tentando editar → 403 |
| 7 | Unicidade | adicionar o mesmo jogo 2× à biblioteca → 409 |
| 8 | Review inválida | `nota: 11` → 422 |
| 9 | Sem token | escrita sem `Authorization` → 401 |
| 10 | Fluxo de denúncia + RBAC | usuário denuncia review → Moderador lista pendentes → Moderador oculta → denúncia `RESOLVIDA`, review some da listagem pública; usuário comum tentando ocultar → 403 |

Todos os erros devem sair no envelope `{ "error": { "code", "message", "details" } }`.

---

## ⚠️ Regras finais para o agente

* Siga o `.ai/` em tudo, **exceto** os dois desvios declarados (SQLite em arquivo e cache in-process no lugar do Redis). Não introduza nenhum outro desvio para "facilitar".
* **O catálogo é a RAWG real.** O `MockRawgClient` existe só como fallback offline sob `USE_RAWG_MOCK=true`; default é a API real.
* Respeite o rate limit: toda leitura de catálogo passa pelo cache-aside antes de chamar a RAWG. Nunca chame a RAWG fora do `RawgClient`.
* Não exponha `RAWG_API_KEY` em logs, respostas ou commits. Falha da RAWG → 502 sem vazar detalhes.
* Como o banco é efêmero, **toda** a massa de demo vem do seed no boot; não dependa de estado persistido entre execuções.
* Commits pequenos e descritivos por fase. Código legível acima de abstração prematura (`standards.md`).

---

## 📤 Entregável final (o agente deve produzir)

1. Backend NestJS rodando localmente conforme a Definition of Done (um `pnpm start:dev` + chave RAWG, sem Docker).
2. `README.md` com: passo a passo de execução, como obter a chave RAWG, credenciais do seed, nota sobre o `dev.db` SQLite recriado via `db:reset`, e como ligar o fallback `USE_RAWG_MOCK` para demo offline.
3. Relatório final em texto contendo:
   * Lista dos arquivos e módulos criados (e os deixados fora do MVP).
   * **Os dois desvios conscientes do `.ai/`** (SQLite em arquivo, cache in-process) e seu impacto.
   * Saída do smoke test (cenários 1–10).
   * Outras decisões tomadas que não estavam explícitas no `.ai/`.
   * Dificuldades encontradas com o agente escolhido (para os comentários da apresentação).
4. Em seguida, **aguarde mais instruções**.
