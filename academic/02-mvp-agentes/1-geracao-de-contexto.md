# Criação do contexto técnico do projeto PixelPress (`.ai/`) — atividade-2

> Você está operando em **Agent Mode**, com permissão para criar arquivos e escrever documentação.
>
> Atue como um **Staff Engineer / Tech Lead Node.js**, responsável por preparar o **contexto técnico e arquitetural** do **PixelPress**, que será implementado posteriormente por outro agente.
>
> Pense como se estivesse escrevendo documentação interna para um time real.

---

## 📌 Contexto do projeto (leia antes de tudo)

O **PixelPress** é um app web de descoberta e tracking de video games (estilo Letterboxd para jogos), já arquitetado nos documentos `01-funcionalidades-principais.md` a `07-fluxos-principais.md`, na raiz do repositório. **Leia esses sete arquivos antes de escrever qualquer linha**; eles são a fonte de verdade do domínio (funcionalidades, papéis RBAC, entidades, endpoints, fluxos).

Resumo do domínio (não substitui a leitura dos docs):

* Catálogo de jogos proveniente da **RAWG Video Games Database API** (read-only, integração HTTP real).
* Backend próprio para dados do usuário: biblioteca pessoal com status, reviews, listas customizadas, follow social, wishlist, perfil com estatísticas.
* Autorização **RBAC** com 4 papéis: Visitante, Usuário registrado, Moderador, Administrador.
* Entidades (item 4): `Usuario`, `Papel`, `Jogo` (referência ao catálogo RAWG), `ItemBiblioteca`, `Review`, `Lista`, `ItemLista`, `Follow`, `ItemWishlist`.
* API REST versionada sob `/api/v1` (item 5).

### ⚠️ Decisão de escopo da atividade-2

Esta atividade é a fase de **implementação do backend**. A única restrição em relação aos docs 1–7:

1. **Backend REST apenas.** Sem frontend, sem SPA.

A stack completa dos itens 3 e 6 se aplica integralmente: **NestJS + Prisma + PostgreSQL + Redis + RAWG API real**.

---

## 🎯 Objetivo

Criar uma pasta `.ai/` na raiz do projeto contendo documentos **claros, prescritivos e não genéricos**, que definem:

* padrões de código
* decisões arquiteturais
* stack tecnológica aprovada
* regras de negócio e domínio do PixelPress

Esses arquivos **não são explicativos**; eles **definem regras** que devem ser seguidas pelo agente implementador.

---

## 📁 Estrutura obrigatória

Criar exatamente a seguinte estrutura:

```
.ai/
├── standards.md
├── architecture.md
├── tech-stack.md
└── business-rules.md
```

---

## 📄 Conteúdo esperado (DETALHADO)

### 🔹 `.ai/standards.md` — Padrões de código e estilo

Defina regras **concretas**, incluindo:

* **Node.js LTS** (mínimo v20); **TypeScript** com `strict: true` obrigatório.
* Uso de:
  * `class` para DTOs com decorators de `class-validator`. Nunca interfaces soltas como tipo de parâmetro de controller.
  * `readonly` em propriedades de DTOs de response.
  * `async/await` em toda operação de I/O (banco, cache, RAWG). Nunca `.then().catch()` inline.
* Convenções NestJS:
  * Controllers finos: recebem request, delegam ao service, devolvem response. Zero lógica de negócio.
  * Lógica de negócio **somente em Services**, incluindo validações de domínio e interação com Prisma e RawgClient.
  * Autorização (RBAC + ownership) em **Guards** NestJS, **nunca no controller**.
* Organização de módulos NestJS (um módulo por domínio):
  ```
  src/
    auth/
    usuarios/
    jogos/              ← integração RAWG + referência local via Prisma
    biblioteca/
    reviews/
    listas/
    social/             ← follow + feed
    wishlist/
    moderacao/
    common/             ← guards, filters, pipes, interceptors, decorators globais
    config/
  prisma/
    schema.prisma       ← fonte de verdade do schema
    migrations/
    seed.ts
  ```
* Nomenclatura de domínio **em português**, consistente com o item 4: `Usuario`, `Jogo`, `ItemBiblioteca`, `Review`, `Lista`, `ItemLista`, `Follow`, `ItemWishlist`.
* `PrismaService` é o único ponto de acesso ao banco; nunca instanciar `PrismaClient` diretamente fora dele.
* Status de biblioteca como **enum** (TypeScript + Prisma): `JOGANDO`, `ZERADO`, `QUERO_JOGAR`, `DROPEI`, `PLATINADO`.
* Versionamento da API sob `/api/v1`.
* Paginação padronizada: query params `page` e `page_size` (default 20, máx 100); resposta com `count`, `next`, `previous`, `results`. Implementar via `skip`/`take` do Prisma.
* Envelope de erro único via `ExceptionFilter` global:
  ```json
  { "error": { "code": "...", "message": "...", "details": [] } }
  ```
* `ValidationPipe` global com `whitelist: true`, `forbidNonWhitelisted: true` e `transform: true`.
* Logger estruturado com `nestjs-pino`. Nenhum `console.log` em código de produção.
* Código legível > abstrações complexas.

Evite qualquer linguagem vaga como "quando possível".

---

### 🔹 `.ai/architecture.md` — Arquitetura e decisões

Descreva explicitamente:

* Arquitetura em **módulos NestJS**: `Controller → Service → Repository (Prisma) → PostgreSQL`.
* Catálogo de jogos via **RAWG API real** (HTTP), encapsulado no módulo `jogos/` via `RawgClient` (`@nestjs/axios`). Nenhum outro módulo chama a RAWG diretamente.
* Cache **Redis** (ioredis) usado exclusivamente para cache-aside das respostas da RAWG com TTL configurável. Dados do usuário nunca passam pelo Redis.
* Padrão cache-aside no fluxo do catálogo (item 7, Fluxo 2): consulta Redis → hit responde; miss chama RAWG, grava no Redis, responde.
* Entidade `Jogo` no banco armazena referência mínima (`rawgId`, `slug`, `nome`, `capaUrl`); criada via upsert no primeiro uso. Detalhes ricos buscados sob demanda da RAWG, nunca persistidos.
* Seed via `prisma/seed.ts`: pelo menos 4 usuários (um por papel), alguns `ItemBiblioteca`, `Review`, `Lista` de exemplo e 1 denúncia pendente. Jogos do seed referenciam `rawgId`s reais.
* Autenticação **stateless via JWT** (`@nestjs/passport` + `passport-jwt`). Autorização **RBAC** via `RolesGuard` + `@Roles(...)`. Ownership validado no service (403).
* Hierarquia de papéis: `ADMIN ⊇ MODERADOR ⊇ USUARIO`.
* Em falha da RAWG: retornar **502 Bad Gateway**. Chave RAWG nunca exposta em logs ou respostas.
* Infraestrutura local via **Docker Compose**: serviços `api`, `postgres`, `redis`.

Inclua **3 decisões arquiteturais** no formato:

```text
Decision:
Context:
Consequence:
```

Sugestões: (1) Prisma vs. TypeORM; (2) Redis cache-aside vs. cache in-memory; (3) JWT stateless vs. sessões.

---

### 🔹 `.ai/tech-stack.md` — Stack tecnológica (PRESCRITIVO)

Defina explicitamente:

* **Node.js LTS** (mínimo v20).
* **NestJS** (mínimo v10), **TypeScript** com `strict: true`.
* Gerenciador de pacotes: **pnpm** (preferido) ou npm.
* Dependências **aprovadas** (runtime):
  * `@nestjs/core`, `@nestjs/common`, `@nestjs/platform-express`
  * `@nestjs/passport`, `passport`, `passport-jwt`, `@nestjs/jwt`
  * `bcrypt`
  * `@nestjs/swagger`, `swagger-ui-express`
  * `class-validator`, `class-transformer`
  * `@nestjs/config`
  * `@nestjs/axios`, `axios` (cliente HTTP para RAWG)
  * `@prisma/client` (ORM, acesso ao PostgreSQL)
  * `ioredis` (cache Redis)
  * `pino`, `nestjs-pino` (logging estruturado)
  * `reflect-metadata`, `rxjs`
* Dependências **aprovadas** (devDependencies):
  * `prisma` (CLI migrations/seed), `ts-node`
  * `@nestjs/testing`, `jest`, `ts-jest`, `supertest`
  * Types: `@types/node`, `@types/passport-jwt`, `@types/bcrypt`, `@types/express`, `@types/jest`, `@types/supertest`
* Dependências **proibidas**:
  * `node-fetch`, `got`, `undici` (usar `@nestjs/axios`)
  * `typeorm`, `sequelize`, `mikro-orm` (Prisma é o ORM aprovado)
  * `mongoose` (banco é relacional)
  * `sqlite3`, `better-sqlite3` (banco de produção é PostgreSQL)
  * `jsdom`, `cheerio`, `puppeteer`, `playwright` (não é crawler)
* Configuração via `@nestjs/config` com arquivo `.env`. Variáveis obrigatórias:
  ```
  DATABASE_URL, REDIS_URL, JWT_SECRET, JWT_EXPIRATION, JWT_REFRESH_EXPIRATION,
  RAWG_API_KEY, RAWG_BASE_URL, RAWG_CACHE_TTL_SECONDS
  ```
* `.env` nunca versionado; `.env.example` com placeholders deve ser versionado.
* Infraestrutura local: **Docker Compose** com `api`, `postgres`, `redis`.

Declare claramente:

> Qualquer dependência fora desta lista não deve ser utilizada sem decisão arquitetural documentada.

---

### 🔹 `.ai/business-rules.md` — Regras de negócio

Documente regras claras, derivadas dos itens 1–7. Não inclua código.

**Catálogo (RAWG API real):**

* Catálogo fornecido pela RAWG API real via HTTP. Nenhum dado de jogo é fictício ou fabricado.
* `Jogo` é referência mínima no banco (`rawgId`, `slug`, `nome`, `capaUrl`); detalhes ricos buscados sob demanda.
* Catálogo é read-only para todos os papéis. Nenhum endpoint permite criar, editar ou deletar jogos.
* Respostas da RAWG cacheadas no Redis com TTL configurável.
* Chave RAWG configurada via `.env`; nunca exposta em logs ou respostas. Em falha da RAWG: 502.

**Autorização (RBAC, item 2):**

* 4 papéis hierárquicos/cumulativos: **Visitante**, **Usuário registrado**, **Moderador** (⊇ Usuário), **Administrador** (⊇ Moderador).
* Reproduza a **matriz de permissões** do item 2 (recurso/ação × papel), com `✅`, `❌` e `próprio`.
* **Ownership**: usuário só edita/exclui biblioteca, reviews, listas e wishlist próprios; caso contrário, 403.
* **Visibilidade**: listas `publica: false` visíveis apenas ao dono e a Admin; Visitante recebe 404.
* **Atribuição de papéis**: apenas Admin concede/revoga; ninguém eleva o próprio papel.

**Regras de domínio (itens 4 e 7):**

* Status de biblioteca restrito ao enum: `JOGANDO`, `ZERADO`, `QUERO_JOGAR`, `DROPEI`, `PLATINADO`. Violação: 422.
* Unicidade reforçada por `@@unique` no schema Prisma e validada no service antes da escrita:
  * `ItemBiblioteca(usuarioId, jogoId)`, `Review(usuarioId, jogoId)`, `ItemWishlist(usuarioId, jogoId)`, `Follow(seguidorId, seguidoId)`. Violação: 409.
* Nota de review: intervalo 0–10 (inteiro); fora disso, 422.
* **Soft-delete de moderação**: Moderador seta `oculto: true` + registra `motivoOcultacao` e `ocultadoPorId`. Nunca apaga fisicamente.
* Fluxo de denúncia: denúncia (status `PENDENTE`) → Moderador lista → Moderador oculta (status `RESOLVIDA`).

**Convenções de API:**

* Sem token → 401. Sem papel/ownership → 403. Não encontrado → 404. Conflito de unicidade → 409. Regra violada → 422. Falha na RAWG → 502.
* Endpoints versionados sob `/api/v1`. Catálogo read-only (escrita retorna 405).
* Toda resposta de erro segue o envelope `{ "error": { "code", "message", "details" } }`.

---

## ⚠️ Regras finais

* Escreva os documentos pensando em **outro agente** (o implementador), não em um leitor humano casual.
* Seja específico e direto; ancore tudo nos itens 1–7.
* Não use frases genéricas.
* Não antecipe implementação (não escreva código de produção dentro dos `.ai/`).

---

## ✅ Entregável

* Pasta `.ai/` criada na raiz.
* Quatro arquivos preenchidos conforme especificado.
* Ao final, apresente:
  * Lista dos arquivos criados.
  * Um resumo objetivo de cada documento.
* Em seguida, **aguarde mais instruções**.
