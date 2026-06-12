# Architecture — PixelPress Backend

## Estilo arquitetural

Aplicação **NestJS em camadas**, com separação estrita de responsabilidades:

```
Controller  →  Service  →  Repository (Prisma)  →  PostgreSQL
     ↑               ↑
  Guards        RawgClient (@nestjs/axios) → Redis (cache-aside) → RAWG API
                SeedService (Prisma seed)
```

Cada camada só conhece a imediatamente abaixo. Controllers não importam repositórios diretamente; services não importam controllers.

## Persistência (dados do usuário)

- Banco relacional: **PostgreSQL**.
- ORM: **Prisma**. Schema definido em `prisma/schema.prisma`; migrations versionadas via `prisma migrate`.
- Nenhuma entidade de usuário é mantida em memória. Toda leitura e escrita passa pelo Prisma Client.
- Unicidade e integridade referencial são reforçadas por constraints no schema Prisma (`@@unique`, `@unique`) e validadas no service antes da escrita (retorna 409 sem depender de exceção de banco).

## Cache (RAWG cache-aside)

- Cache: **Redis**, acessado via `ioredis`.
- Padrão: **cache-aside** exclusivamente para respostas da RAWG API.
  - Leitura: consulta Redis primeiro; em hit, responde sem chamar a RAWG.
  - Em miss: chama RAWG, normaliza payload, grava no Redis com TTL (`RAWG_CACHE_TTL_SECONDS`) e responde.
- Dados do usuário (biblioteca, reviews, etc.) **nunca** passam pelo Redis.
- Redis não é usado para sessão nem para rate limit.

## Integração com a RAWG API (catálogo)

- O módulo `jogos/` encapsula toda comunicação com a RAWG via `RawgClient` (wrapper sobre `@nestjs/axios`).
- Nenhum outro módulo chama a RAWG diretamente; toda consulta de catálogo passa pelo `JogosService`.
- A chave de API RAWG (`RAWG_API_KEY`) é configurada via variável de ambiente; nunca exposta em logs, respostas ou código versionado.
- Em falha da RAWG (timeout, 5xx), o backend retorna **502 Bad Gateway** com mensagem padronizada.
- A entidade `Jogo` no banco armazena apenas referência mínima: `id`, `rawgId`, `slug`, `nome`, `capaUrl`. Detalhes ricos (screenshots, trailers, metacritic) são buscados sob demanda da RAWG e não são persistidos.

## Seed

- `prisma/seed.ts` (ou `src/seed/seed.service.ts` com `OnApplicationBootstrap`) popula o banco no primeiro boot.
- Deve incluir: pelo menos 4 usuários (Usuário, Moderador, Admin e um usuário inativo), alguns `ItemBiblioteca`, `Review` e `Lista` de exemplo, e 1 denúncia pendente para viabilizar o fluxo de moderação.
- Jogos do seed referenciam `rawgId`s reais do catálogo RAWG.

## Autenticação e autorização

- **Autenticação**: stateless via **JWT** (access + refresh). Implementado com `@nestjs/passport` + `passport-jwt`.
- **Autorização RBAC**: `RolesGuard` global verifica o papel do usuário extraído do JWT contra o decorator `@Roles(...)` do endpoint.
- **Ownership**: validado no **service**. O service compara `userId` do token com o campo dono da entidade carregada do banco. Falha retorna `ForbiddenException` (403).
- Hierarquia de papéis: `ADMIN ⊇ MODERADOR ⊇ USUARIO`. Visitante não possui token.

## Fronteira catálogo vs. dados do usuário

| Dado | Origem | Persistência |
|------|--------|--------------|
| Catálogo (jogos, detalhes, screenshots) | RAWG API (HTTP) | Redis com TTL |
| Referência local (`Jogo`) | Criada no primeiro uso via upsert | PostgreSQL (Prisma) |
| Dados do usuário (biblioteca, reviews, etc.) | Backend próprio | PostgreSQL (Prisma) |

## Restrições explícitas

- Sem Map/array in-memory para estado de negócio; toda persistência passa pelo Prisma.
- Sem banco em memória (H2, SQLite) no runtime principal.
- Chamadas HTTP externas são permitidas **exclusivamente** para a RAWG API, via `RawgClient`.
- O projeto não é um crawler. Toda consulta ao catálogo usa endpoints oficiais da RAWG.

---

## Decisões arquiteturais

```text
Decision: Prisma como ORM sobre PostgreSQL em vez de TypeORM ou acesso direto ao banco.
Context:  O item 6 lista Prisma como ORM recomendado. Migrations versionadas e tipagem
          gerada automaticamente reduzem erros de schema drift e aumentam produtividade.
Consequence: Schema é fonte de verdade em prisma/schema.prisma. Mudanças de modelo exigem
             migration explícita. Prisma Client gerado deve ser re-executado após todo
             schema change (prisma generate).
```

```text
Decision: Redis exclusivamente para cache-aside da RAWG, não para sessões nem dados de usuário.
Context:  O item 6 define Redis para cachear respostas da RAWG e reduzir chamadas externas.
          Usar Redis para sessões criaria estado compartilhado incompatível com JWT stateless.
Consequence: Dados de usuário têm PostgreSQL como fonte de verdade. Cache Redis pode ser
             descartado sem perda de dado persistente. TTL configurável permite ajustar
             trade-off entre frescor dos dados de catálogo e volume de chamadas à RAWG.
```

```text
Decision: Autenticação JWT stateless com RolesGuard em vez de sessões server-side.
Context:  O item 3 define API REST stateless com JWT. Sessões exigiriam store compartilhado
          (Redis ou banco), adicionando complexidade e acoplamento.
Consequence: Cada requisição carrega userId e papel no token. Logout é tratado por expiração
             ou blocklist opcional no Redis. Escalabilidade horizontal não requer sessão
             compartilhada.
```
