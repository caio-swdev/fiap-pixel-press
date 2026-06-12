# Business Rules — PixelPress Backend

## 1. Catálogo de jogos (RAWG API)

- O catálogo é fornecido pela **RAWG Video Games Database API** (`https://api.rawg.io/api`). Toda consulta de catálogo usa endpoints oficiais da RAWG.
- A entidade `Jogo` no banco armazena apenas referência mínima: `id`, `rawgId`, `slug`, `nome`, `capaUrl`. Criada via upsert na primeira vez que um usuário referencia um jogo (biblioteca, wishlist, lista). Detalhes ricos (screenshots, trailers, metacritic) são buscados sob demanda da RAWG e nunca persistidos.
- O catálogo é **read-only** para todos os papéis, incluindo Admin. Nenhum endpoint permite criar, editar ou deletar jogos.
- Respostas da RAWG são cacheadas no **Redis** (cache-aside) com TTL configurável para reduzir chamadas e respeitar o rate limit.

## 2. API Key e rate limit da RAWG

- A chave de integração RAWG (`RAWG_API_KEY`) é obrigatória em toda chamada à RAWG. Configurada via variável de ambiente; nunca exposta em logs, respostas ou código versionado.
- O rate limit da RAWG (100 requisições/dia no plano gratuito) é mitigado pelo cache Redis. Quando o cache absorve a requisição, a RAWG não é chamada.
- Em falha na RAWG (timeout, 4xx, 5xx), o backend retorna **502 Bad Gateway** com mensagem padronizada. Nunca expõe detalhes da resposta da RAWG ao cliente.

## 3. Autorização RBAC

### Papéis

| # | Papel | Descrição |
|---|-------|-----------|
| 1 | **Visitante** | Não autenticado. Acesso read-only a conteúdo público. |
| 2 | **Usuário registrado** | Autenticado. Gerencia própria biblioteca, reviews, listas, wishlist e relações sociais. |
| 3 | **Moderador** | Herda todas as permissões de Usuário registrado. Modera conteúdo de terceiros. |
| 4 | **Administrador** | Herda todas as permissões de Moderador. Gerencia usuários, papéis e configuração do catálogo. |

Hierarquia: `ADMIN ⊇ MODERADOR ⊇ USUARIO`. Papéis são cumulativos.

### Matriz de permissões

| # | Recurso / Ação | Visitante | Usuário | Moderador | Admin |
|---|----------------|-----------|---------|-----------|-------|
| 1 | Buscar jogos / ver detalhes (catálogo RAWG) | ✅ | ✅ | ✅ | ✅ |
| 2 | Ver perfis e listas públicas | ✅ | ✅ | ✅ | ✅ |
| 3 | Gerenciar própria biblioteca (status, horas) | ❌ | ✅ próprio | ✅ próprio | ✅ próprio |
| 4 | Criar / editar / excluir review | ❌ | ✅ próprio | ✅ próprio | ✅ próprio |
| 5 | Criar listas customizadas (públicas/privadas) | ❌ | ✅ próprio | ✅ próprio | ✅ próprio |
| 6 | Seguir usuários / interagir socialmente | ❌ | ✅ | ✅ | ✅ |
| 7 | Gerenciar wishlist | ❌ | ✅ próprio | ✅ próprio | ✅ próprio |
| 8 | Denunciar conteúdo | ❌ | ✅ | ✅ | ✅ |
| 9 | Moderar conteúdo reportado (ocultar) | ❌ | ❌ | ✅ | ✅ |
| 10 | Suspender / banir usuários | ❌ | ❌ | ✅ | ✅ |
| 11 | Gerenciar usuários e atribuir papéis | ❌ | ❌ | ❌ | ✅ |
| 12 | Configurar chave/rate-limit do catálogo | ❌ | ❌ | ❌ | ✅ |

### Regras de ownership

- Usuário só pode editar ou excluir `ItemBiblioteca`, `Review`, `Lista`, `ItemLista` e `ItemWishlist` que pertencem ao seu próprio `usuarioId`. Tentativa sobre recurso de terceiro retorna **403**.
- Moderador e Admin podem moderar (ocultar) conteúdo de qualquer usuário, mas **não** editar o conteúdo original.
- Apenas Admin pode conceder ou revogar papéis. Nenhum usuário pode elevar o próprio papel.

### Visibilidade de conteúdo privado

- Listas marcadas como `publica: false` são visíveis apenas ao dono e a Admin.
- Visitante nunca acessa conteúdo privado. Retornar **404** (não **403**) para não expor a existência do recurso.

## 4. Regras de domínio

### Status de biblioteca

Valores aceitos (enum `StatusBiblioteca`): `JOGANDO`, `ZERADO`, `QUERO_JOGAR`, `DROPEI`, `PLATINADO`. Qualquer outro valor retorna **422**.

### Unicidade

Reforçada tanto por constraints no schema Prisma (`@@unique`) quanto por validação no service antes da escrita. Violação retorna **409 Conflict**:

| # | Combinação | Descrição |
|---|------------|-----------|
| 1 | `ItemBiblioteca(usuarioId, jogoId)` | Um usuário não pode adicionar o mesmo jogo duas vezes à biblioteca |
| 2 | `Review(usuarioId, jogoId)` | Um usuário escreve no máximo uma review por jogo |
| 3 | `ItemWishlist(usuarioId, jogoId)` | Um jogo aparece uma única vez na wishlist do usuário |
| 4 | `Follow(seguidorId, seguidoId)` | Um usuário não pode seguir o mesmo usuário duas vezes |

### Review

- `nota` deve estar no intervalo **0 a 10** (inteiro). Valores fora do intervalo retornam **422**.
- `spoiler` (boolean) é obrigatório na criação.
- `oculto` é `false` por padrão; só pode ser alterado para `true` por Moderador ou Admin via rota de moderação.

### Soft-delete de moderação

- Moderador **nunca apaga fisicamente** o conteúdo de outro usuário.
- A ação de moderação seta `oculto: true` na entidade e registra `motivoOcultacao` e `ocultadoPorId` (userId do moderador).
- Conteúdo oculto não aparece em listagens públicas, mas permanece acessível via rotas de moderação.

## 5. Fluxo de denúncias

1. Usuário registrado cria uma denúncia (`POST /api/v1/reports`) informando o recurso denunciado (reviewId ou listaId) e o motivo. Status inicial: `PENDENTE`.
2. Moderador lista denúncias pendentes (`GET /api/v1/moderation/reports?status=PENDENTE`).
3. Moderador oculta o conteúdo (`PATCH /api/v1/reviews/{id}/hide`). Status da denúncia passa para `RESOLVIDA`.
4. Denúncia não remove o conteúdo; apenas o oculta.

## 6. Convenções de API

- Toda escrita exige JWT válido no header `Authorization: Bearer <token>`. Ausência de token retorna **401**.
- Ausência de papel adequado ou violação de ownership retorna **403**.
- Recurso não encontrado retorna **404**.
- Endpoints do catálogo (`/api/v1/games/*`) são read-only; métodos de escrita retornam **405 Method Not Allowed**.
- API versionada sob `/api/v1`. Mudanças incompatíveis criam `/api/v2`.
- Toda resposta de erro segue o envelope definido em `standards.md`.
