# Relatório final — MVP backend PixelPress (atividade-2)

## 1. Visão geral

Backend NestJS 10 executável localmente **sem Docker**, demonstrando o domínio do PixelPress:
catálogo via **RAWG real** (com fallback offline), autenticação JWT, RBAC hierárquico, ownership,
biblioteca, reviews e fluxo de moderação. Persistência via **Prisma**; cache-aside in-process.

- **Build:** `pnpm build` sem erros.
- **Boot:** `pnpm start:dev` (prestart garante `prisma generate + db push + seed`).
- **Smoke test:** 10 cenários da Definition of Done — **todos passam** (seção 5).

---

## 2. Arquivos e módulos criados

### Plataforma transversal
| # | Caminho | Papel |
|---|---------|-------|
| 1 | `src/main.ts` | Bootstrap: ValidationPipe global, ExceptionFilter, prefixo `/api/v1`, Swagger `/api/docs`, pino |
| 2 | `src/app.module.ts` | Composição dos módulos |
| 3 | `src/config/config.module.ts` · `env.validation.ts` | ConfigModule global + validação do `.env` (class-validator) |
| 4 | `src/common/prisma/` | `PrismaService` (global, único acesso ao banco) + módulo |
| 5 | `src/common/cache/` | `CacheService` in-process (Map + TTL) — **exclusivo RAWG** |
| 6 | `src/common/filters/all-exceptions.filter.ts` | Envelope `{ error: { code, message, details } }` |
| 7 | `src/common/guards/` | `JwtAuthGuard`, `RolesGuard` (hierárquico) |
| 8 | `src/common/decorators/` | `@Roles()`, `@UsuarioAtual()` |
| 9 | `src/common/pagination/paginate.ts` · `dto/pagination-query.dto.ts` | Envelope `count/next/previous/results` via skip/take |
| 10 | `src/common/enums/` | `Papel`, `StatusBiblioteca`, `StatusDenuncia` (fonte de verdade TS) |
| 11 | `src/common/exceptions/domain.exception.ts` | Exceções de domínio com código estável e status semântico |

### Domínio (dentro do MVP)
| # | Módulo | Conteúdo |
|---|--------|----------|
| 1 | `src/auth/` | register, login, refresh (JWT access+refresh), `JwtStrategy`, bcrypt |
| 2 | `src/usuarios/` | perfil (`me`, `:id`, update) + `:id/papel` (Admin) + listagem (Admin) |
| 3 | `src/jogos/` | `JogosService` (cache-aside + upsert), `RawgClient` (interface), `HttpRawgClient`, `MockRawgClient`, `jogos.fixture.json` |
| 4 | `src/biblioteca/` | adicionar/atualizar/remover `ItemBiblioteca`, unicidade, ownership |
| 5 | `src/reviews/` | criar/editar/excluir review (nota 0–10, unicidade, ownership) + rota `:id/hide` |
| 6 | `src/moderacao/` | criar denúncia (`/reports`), listar pendentes (`/moderation/reports`), ocultar (soft-delete) |

### Persistência
| # | Caminho | Papel |
|---|---------|-------|
| 1 | `prisma/schema.prisma` | provider `sqlite`; models `Usuario`, `Jogo`, `ItemBiblioteca`, `Review`, `Denuncia` com `@@unique` |
| 2 | `prisma/seed.ts` | 4 usuários (1 por papel + inativo), 4 jogos, 2 itens, 2 reviews, 1 denúncia pendente |

### Fora do MVP (declarados, vazios)
`src/listas/listas.module.ts`, `src/social/social.module.ts`, `src/wishlist/wishlist.module.ts` —
módulos NestJS sem controllers/services, registrados no `AppModule` para preservar a estrutura de
`standards.md` sem quebrar o build. Serão implementados numa entrega futura.

---

## 3. Os dois desvios conscientes do `.ai/` e seu impacto

| # | Regra original (`.ai/`) | Override no MVP | Impacto |
|---|-------------------------|-----------------|---------|
| 1 | **PostgreSQL**; `sqlite3`/`better-sqlite3` proibidos | **SQLite em arquivo** via Prisma (`provider = "sqlite"`, `DATABASE_URL="file:./dev.db"`), gitignored | Roda com um `pnpm start:dev`, sem Docker. **Consequência técnica:** SQLite não suporta `enum` → `Papel` e `StatusBiblioteca` viram `String` no schema, mantendo o **enum TypeScript** como fonte de verdade e validando com `@IsEnum(...)` nos DTOs. Banco efêmero: toda massa vem do seed no boot |
| 2 | **Cache-aside em Redis** (`ioredis`) | **Cache-aside in-process** (`CacheService`: `Map` + TTL, sem dependência nova) | Cumpre o papel do cache do `architecture.md` e protege o rate limit da RAWG (100 req/dia). **Limitação:** o cache vive no processo (não compartilhado entre instâncias) e zera no restart — aceitável para a demo de instância única |

**Não desviado:** catálogo continua a **RAWG real** (o que o `.ai/` sempre pediu); Prisma permanece
como ORM e único acesso ao banco; JWT real, RBAC real, ownership real, validações reais.
`ioredis` foi removido (cache in-process não precisa). Demais proibições do `tech-stack.md`
(`typeorm`, `sequelize`, `mongoose`, `node-fetch`, `got`, `undici`, `puppeteer`, `cheerio`, etc.)
**continuam respeitadas**.

---

## 4. Decisões tomadas não explícitas no `.ai/`

| # | Decisão | Justificativa |
|---|---------|---------------|
| 1 | Referência a jogo por **`slug`** nos DTOs de biblioteca/reviews | O slug é a chave pública da RAWG (`/games/{slug}`); o service faz `garantirReferencia(slug)` → detalhe via cache → **upsert** da referência mínima `Jogo` no primeiro uso |
| 2 | Nota da review fora de 0–10 → **422** (não 400) | A DoD (cenário 8) exige 422; faixa é regra de negócio validada no service. O DTO valida só `@IsInt` (a faixa não vira erro de ValidationPipe, que seria 400) |
| 3 | `RolesGuard` **hierárquico** por nível numérico | `ADMIN(3) ⊇ MODERADOR(2) ⊇ USUARIO(1)`; `@Roles(MODERADOR)` aceita papéis ≥ 2 |
| 4 | Rota `PATCH /reviews/:id/hide` delega ao `ModeracaoService` | Mantém o path de `business-rules.md` no recurso `reviews`, mas concentra a lógica de moderação (e a resolução da denúncia) num só service. `ReviewsModule` importa `ModeracaoModule` (sem ciclo) |
| 5 | Ocultar review **resolve em transação** as denúncias pendentes dela (`PENDENTE → RESOLVIDA`) | Atende o passo 3 do fluxo de denúncias; `$transaction` garante atomicidade |
| 6 | `redact` no logger pino para `authorization` e `query.key` | Reforça que a `RAWG_API_KEY` e tokens nunca aparecem em logs |
| 7 | Variável `PORT` (default 3000) lida em `main.ts` | Permite contornar conflito de porta (no ambiente WSL2 de teste, a 3000 era reservada pelo host Windows; o smoke rodou em `PORT=3100`) |
| 8 | `prestart:dev` roda `generate + db push + seed` | Garante banco populado a cada boot sem passo manual, dado que `dev.db` é efêmero |

---

## 5. Saída do smoke test (cenários 1–10)

Executado contra um banco recém-resetado (`pnpm db:reset`). Cenários 1–4 e 6–10 na instância
padrão (mock ligado para rodar offline); cenário 5 numa instância com `USE_RAWG_MOCK=false` e
`RAWG_API_KEY` inválida.

```
== #1 Swagger docs ==              ✅ GET /api/docs → 200
== #2 Login seed (usuaria) ==      ✅ POST /auth/login → 200 + JWT
== #3 Catalogo (miss -> hit) ==    ✅ GET /games?search=witcher → 200 / 2ª chamada idêntica servida do cache (200)
== #4 Detalhe por slug ==          ✅ GET /games/the-witcher-3-wild-hunt → 200
== #5 Falha RAWG (chave invalida)  ✅ GET /games?search=zelda → 502, envelope CATALOGO_INDISPONIVEL, chave NÃO vaza
== #6 Biblioteca + ownership ==    ✅ POST /biblioteca → 201 ; outro usuário edita → 403
== #7 Unicidade ==                 ✅ mesmo jogo 2x → 409 (ITEM_BIBLIOTECA_DUPLICADO)
== #8 Review invalida ==           ✅ nota:11 → 422 (NOTA_INVALIDA)
== #9 Sem token ==                 ✅ escrita sem Authorization → 401
== #10 Denuncia + RBAC ==          ✅ usuário denuncia → moderador lista pendentes (2)
                                   ✅ usuário comum lista pendentes → 403
                                   ✅ usuário comum oculta → 403
                                   ✅ moderador oculta → 200 ; review some da listagem pública
                                   ✅ denúncia da review → RESOLVIDA

RESULTADO: PASS=15 / FAIL=0  (15 asserções cobrindo os 10 cenários)
```

Saída literal #5 (chave inválida, mock off):
```
{"error":{"code":"CATALOGO_INDISPONIVEL","message":"Não foi possível consultar o catálogo de jogos no momento.","details":[]}}
HTTP=502
chave NAO vaza na resposta ✅
```

> Observação sobre o cenário 3 (RAWG real): as asserções de smoke foram executadas com
> `USE_RAWG_MOCK=true` (sem chave RAWG disponível no ambiente de teste), que exercita a mesma
> mecânica de **cache-aside (miss → hit)** do `JogosService`. O caminho HTTP real (`HttpRawgClient`)
> foi exercitado de fato no cenário 5, que faz uma chamada real à RAWG e mapeia a falha para 502.
> Com uma `RAWG_API_KEY` válida e `USE_RAWG_MOCK=false`, os mesmos endpoints retornam dados reais.

---

## 6. Dificuldades com o agente (para a apresentação)

| # | Dificuldade | Como foi resolvida |
|---|-------------|--------------------|
| 1 | **pnpm 10 bloqueia build scripts** por padrão (`bcrypt`, `prisma`, `@prisma/client` não compilavam) | Declarado `pnpm.onlyBuiltDependencies` no `package.json` + `pnpm rebuild` para forçar a compilação nativa |
| 2 | **`forbidNonWhitelisted` barrava `?status=PENDENTE`** em `/moderation/reports` (400) | Criado `ListarDenunciasDto` com `@IsOptional() @IsEnum(StatusDenuncia) status`, em vez do DTO genérico de paginação |
| 3 | **Nota 11 retornava 400** (ValidationPipe) em vez de 422 | Removido `@Max(10)` do DTO; faixa 0–10 validada no service como regra de negócio (422) |
| 4 | **`EADDRINUSE :::3000` mesmo com a porta livre** no Linux | Ambiente WSL2 com networking espelhado: o host Windows reservava a 3000 (invisível a `ss`/`lsof`). Contornado com `PORT` configurável; app mantém default 3000 conforme a DoD |
| 5 | **União de tipos `{x} \| {x?: undefined}`** quebrava `strict` ao montar `extraQuery` de paginação | Anotação explícita `Record<string, string>` nas variáveis |

---

## 7. Status

✅ Backend rodando localmente (um `pnpm start:dev`, sem Docker). ✅ Build limpo. ✅ Smoke 1–10 verde.
✅ README e este relatório entregues. **Aguardando próximas instruções.**
