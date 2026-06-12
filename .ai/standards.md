# Standards — PixelPress Backend

## Linguagem e compilador

- **Node.js LTS** (mínimo v20). Versões non-LTS proibidas em produção.
- **TypeScript** com `strict: true` obrigatório. Nenhum `any` explícito; use `unknown` e narrowing quando o tipo é incerto.
- `tsconfig.json` deve conter no mínimo:
  ```json
  { "compilerOptions": { "strict": true, "target": "ES2022", "module": "commonjs" } }
  ```

## DTOs

- Toda entrada de API (body, query, param) deve ser um `class` TypeScript decorado com `class-validator`. Nunca use interface ou objeto literal como tipo de parâmetro de controller.
- Propriedades de DTOs de response devem ser `readonly`.
- `class-transformer` é obrigatório no pipeline; use `@Expose()` e `@Exclude()` para controlar o que é serializado.
- Nunca exponha campos internos do Prisma (como `senhaHash`) em DTOs de response.

## Async

- Toda operação de I/O (banco, cache, RAWG) deve usar `async/await`.
- Nunca use `.then().catch()` inline; centralize tratamento de erro nos `ExceptionFilter`.
- `Promise` explícita apenas em assinaturas de interface/repositório; em implementação, use `async`.

## Convenções NestJS

- **Controllers finos**: recebem request, delegam ao service, devolvem response. Zero lógica de negócio ou condicionais de domínio.
- **Services**: toda lógica de negócio, validações de domínio (unicidade, regras de ownership) e interação com Prisma Client e RawgClient.
- **Guards**: toda autorização RBAC e checagem de ownership. Nunca no controller, nunca no service.
- **Pipes**: `ValidationPipe` global com `whitelist: true` e `forbidNonWhitelisted: true`.
- **Filters**: `ExceptionFilter` global para mapear exceções de domínio para o envelope de erro padrão.
- **Interceptors**: use apenas para transformação de response (ex: `ClassSerializerInterceptor`).

## Organização de módulos

Cada domínio é um módulo NestJS independente. Estrutura obrigatória:

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
  config/             ← ConfigModule, variáveis de ambiente
prisma/
  schema.prisma       ← fonte de verdade do schema
  migrations/
  seed.ts
```

Cada módulo contém: `*.module.ts`, `*.controller.ts`, `*.service.ts`, `dto/`, e acessa o banco via `PrismaService` (injetado).

## Prisma

- `PrismaService` é um provider global injetável em qualquer service.
- Nunca instancie `PrismaClient` diretamente fora do `PrismaService`.
- Toda mudança de schema exige migration explícita (`prisma migrate dev`). Nunca use `prisma db push` em produção.
- Após qualquer mudança no `schema.prisma`, executar `prisma generate` antes de compilar.

## Nomenclatura de domínio

Nomes de entidades sempre **em português**, consistentes com o item 4 da documentação e com o `schema.prisma`:

| Entidade | Model Prisma |
|----------|--------------|
| `Usuario` | `Usuario` |
| `Jogo` | `Jogo` |
| `ItemBiblioteca` | `ItemBiblioteca` |
| `Review` | `Review` |
| `Lista` | `Lista` |
| `ItemLista` | `ItemLista` |
| `Follow` | `Follow` |
| `ItemWishlist` | `ItemWishlist` |

## Enum de status de biblioteca

```typescript
enum StatusBiblioteca {
  JOGANDO     = 'JOGANDO',
  ZERADO      = 'ZERADO',
  QUERO_JOGAR = 'QUERO_JOGAR',
  DROPEI      = 'DROPEI',
  PLATINADO   = 'PLATINADO',
}
```

Definido tanto no `schema.prisma` quanto como enum TypeScript. Validar com `@IsEnum(StatusBiblioteca)` no DTO.

## Versionamento de API

Todos os endpoints sob `/api/v1`. Mudanças incompatíveis criam `/api/v2`; nunca quebrar a versão corrente.

## Paginação

Todos os endpoints de listagem seguem o contrato abaixo:

- Query params: `page` (default: 1) e `page_size` (default: 20, máx: 100).
- Response envelope:
  ```json
  {
    "count": 42,
    "next": "/api/v1/jogos?page=3&page_size=20",
    "previous": "/api/v1/jogos?page=1&page_size=20",
    "results": []
  }
  ```
- `next` e `previous` são `null` quando não existem páginas adjacentes.
- Implementar paginação via `skip`/`take` do Prisma.

## Envelope de erro

Toda exceção não tratada deve ser capturada pelo `ExceptionFilter` global e retornar:

```json
{
  "error": {
    "code": "REVIEW_DUPLICADA",
    "message": "Já existe uma review deste usuário para este jogo.",
    "details": []
  }
}
```

Status HTTP semântico: 400 (validação), 401 (sem token), 403 (sem permissão/ownership), 404 (não encontrado), 409 (conflito de unicidade), 422 (regra de negócio violada), 502 (falha na RAWG).

## Validação

- `ValidationPipe` registrado globalmente em `main.ts` com `whitelist: true`, `forbidNonWhitelisted: true` e `transform: true`.
- Todo DTO de request usa decorators de `class-validator`. Nenhuma validação manual com `if` no controller ou service.

## Logging

- Use `nestjs-pino` como logger estruturado. Nenhum `console.log` em código de produção.
- Logs de erro devem incluir `requestId`, `userId` (quando autenticado) e stack trace.

## Qualidade

- Código legível > abstrações complexas. Três linhas claras valem mais que uma abstração prematura.
- Testes (Jest + Supertest) são desejáveis, mas não obrigatórios nesta fase.
