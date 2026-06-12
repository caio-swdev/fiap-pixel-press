# Tech Stack — PixelPress Backend

## Runtime e linguagem

| # | Item | Versão mínima | Observação |
|---|------|---------------|------------|
| 1 | Node.js | 20 (LTS) | Versões non-LTS proibidas em produção |
| 2 | TypeScript | 5.x | `strict: true` obrigatório |
| 3 | NestJS | 10.x | Framework principal |

## Gerenciador de pacotes

**pnpm** (preferido) ou **npm**. Yarn não é utilizado neste projeto. Lockfile deve ser versionado.

## Dependências aprovadas

### Runtime

| # | Pacote | Finalidade |
|---|--------|------------|
| 1 | `@nestjs/core` | Core do framework |
| 2 | `@nestjs/common` | Decorators, pipes, guards, filters |
| 3 | `@nestjs/platform-express` | Adapter HTTP (Express) |
| 4 | `@nestjs/passport` | Integração Passport com NestJS |
| 5 | `passport` | Framework de autenticação |
| 6 | `passport-jwt` | Estratégia JWT para Passport |
| 7 | `@nestjs/jwt` | Utilitários JWT (sign/verify) |
| 8 | `bcrypt` | Hash de senha |
| 9 | `@nestjs/swagger` | Documentação OpenAPI |
| 10 | `swagger-ui-express` | Interface Swagger UI |
| 11 | `class-validator` | Validação de DTOs |
| 12 | `class-transformer` | Serialização/deserialização de DTOs |
| 13 | `@nestjs/config` | Gerenciamento de variáveis de ambiente |
| 14 | `@nestjs/axios` | Cliente HTTP para integração com a RAWG API |
| 15 | `axios` | Dependência peer de `@nestjs/axios` |
| 16 | `@prisma/client` | Prisma Client (ORM, acesso ao PostgreSQL) |
| 17 | `ioredis` | Cliente Redis (cache-aside RAWG) |
| 18 | `pino` | Logger estruturado |
| 19 | `nestjs-pino` | Integração Pino com NestJS |
| 20 | `reflect-metadata` | Suporte a decorators (obrigatório pelo NestJS) |
| 21 | `rxjs` | Dependência interna do NestJS |

### DevDependencies

| # | Pacote | Finalidade |
|---|--------|------------|
| 1 | `prisma` | CLI Prisma (migrations, generate, seed) |
| 2 | `@types/node` | Tipos Node.js |
| 3 | `@types/passport-jwt` | Tipos passport-jwt |
| 4 | `@types/bcrypt` | Tipos bcrypt |
| 5 | `@types/express` | Tipos Express |
| 6 | `typescript` | Compilador TypeScript |
| 7 | `ts-node` | Execução TypeScript direta (seed, scripts) |
| 8 | `@nestjs/testing` | Utilitários de teste NestJS |
| 9 | `jest` | Runner de testes |
| 10 | `ts-jest` | Transformador TypeScript para Jest |
| 11 | `supertest` | Testes de integração HTTP |
| 12 | `@types/jest` | Tipos Jest |
| 13 | `@types/supertest` | Tipos Supertest |

## Dependências proibidas

| # | Pacote(s) | Motivo |
|---|-----------|--------|
| 1 | `node-fetch`, `got`, `undici` | Usar `@nestjs/axios` como cliente HTTP padrão |
| 2 | `typeorm`, `sequelize`, `mikro-orm` | Prisma é o ORM aprovado |
| 3 | `mongoose` | Banco é relacional (PostgreSQL), não MongoDB |
| 4 | `sqlite3`, `better-sqlite3` | Banco de produção é PostgreSQL |
| 5 | `jsdom`, `cheerio`, `puppeteer`, `playwright` | O projeto não é um crawler |
| 6 | `@nestjs/typeorm`, `@nestjs/mongoose`, `@nestjs/sequelize` | Consequência dos itens 2 e 3 acima |

> **Qualquer dependência fora da lista aprovada não deve ser utilizada sem decisão arquitetural documentada.**

## Infraestrutura local

Conforme item 6, o ambiente local é provisionado via **Docker Compose** com três serviços:

```yaml
services:
  api:      # NestJS backend
  postgres: # PostgreSQL (imagem oficial)
  redis:    # Redis (imagem oficial)
```

## Configuração

- Variáveis de ambiente via `@nestjs/config` com arquivo `.env` na raiz.
- `.env` nunca é versionado; `.env.example` com placeholders deve ser versionado.
- Variáveis obrigatórias:

  ```
  DATABASE_URL=postgresql://user:password@localhost:5432/pixelpress
  REDIS_URL=redis://localhost:6379
  JWT_SECRET=<string longa e aleatória>
  JWT_EXPIRATION=3600s
  JWT_REFRESH_EXPIRATION=7d
  RAWG_API_KEY=<chave real obtida em rawg.io>
  RAWG_BASE_URL=https://api.rawg.io/api
  RAWG_CACHE_TTL_SECONDS=300
  ```
