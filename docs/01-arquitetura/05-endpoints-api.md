# Item 5 — Endpoints da API (Rotas REST)

## Prompt

```
Você é um arquiteto de software trabalhando na Phase C (Application Architecture) do TOGAF ADM.

Contexto:
- Domínio: app web de descoberta e tracking de video games (estilo Letterboxd para jogos).
- Backend: API REST stateless, autenticação via JWT, autorização RBAC (Visitante, Usuario, Moderador, Admin).
- Catálogo vem da RAWG API (cacheada no backend); dados do usuário no banco relacional.
- Entidades (item 4): Usuario, Papel, Jogo, ItemBiblioteca, Review, Lista, ItemLista, Follow, ItemWishlist.

Tarefa:
Defina as principais rotas REST da API, agrupadas por recurso.
1. Para cada endpoint, especifique: método HTTP, path, descrição em 1 frase, e papel mínimo exigido (público / usuario / moderador / admin).
2. Use convenções REST: substantivos no plural, sub-recursos aninhados quando fizer sentido, verbos só em ações que não mapeiam para CRUD.
3. Inclua paginação/filtros nas rotas de listagem (query params) e indique quais ações exigem ownership (só o dono do recurso).
4. Cubra: autenticação, catálogo de jogos (proxy RAWG), biblioteca, reviews, listas, social (follow/feed), wishlist, perfil/estatísticas e moderação.

Restrições:
- Seguir REST/HTTP semântico (GET idempotente, POST cria, PUT/PATCH atualiza, DELETE remove).
- Endpoints de catálogo (jogos) são proxy read-only da RAWG, sem escrita.
- Toda escrita exige JWT; ownership validado no backend (403 se não for dono e não for moderador/admin).
- Versionar a API sob /api/v1.

Formato de saída:
- Tabelas Markdown agrupadas por recurso, colunas: Método | Path | Descrição | Papel mínimo.
- Seção final "Convenções" com regras de paginação, formato de erro e auth header.
```

## Output (rascunho, validar e refinar com a ferramenta)

> Base path: `/api/v1`. Autenticação: `Authorization: Bearer <jwt>`.

### Autenticação

| # | Método | Path | Descrição | Papel mínimo |
|---|--------|------|-----------|--------------|
| 1 | POST | `/auth/register` | Cria nova conta de usuário | público |
| 2 | POST | `/auth/login` | Autentica e retorna JWT | público |
| 3 | POST | `/auth/refresh` | Renova o token de acesso | usuario |
| 4 | GET | `/auth/me` | Retorna o usuário autenticado | usuario |

### Catálogo de Jogos (proxy RAWG, read-only)

| # | Método | Path | Descrição | Papel mínimo |
|---|--------|------|-----------|--------------|
| 5 | GET | `/games?search=&genre=&platform=&year=&page=` | Busca no catálogo RAWG com filtros e paginação | público |
| 6 | GET | `/games/{rawgId}` | Detalhes de um jogo (screenshots, trailers, lojas) | público |
| 7 | GET | `/games/{rawgId}/similar` | Lista jogos similares | público |
| 8 | GET | `/games/releases?platform=&from=&to=` | Feed de lançamentos recentes/próximos | público |

### Biblioteca

| # | Método | Path | Descrição | Papel mínimo |
|---|--------|------|-----------|--------------|
| 9 | GET | `/users/{id}/library?status=&page=` | Lista a biblioteca de um usuário (respeita privacidade) | público |
| 10 | POST | `/library` | Adiciona um jogo à própria biblioteca com status | usuario |
| 11 | PATCH | `/library/{itemId}` | Atualiza status/horas de um item (ownership) | usuario (dono) |
| 12 | DELETE | `/library/{itemId}` | Remove item da própria biblioteca (ownership) | usuario (dono) |

### Reviews

| # | Método | Path | Descrição | Papel mínimo |
|---|--------|------|-----------|--------------|
| 13 | GET | `/games/{rawgId}/reviews?page=` | Lista reviews de um jogo | público |
| 14 | POST | `/reviews` | Cria review (nota + texto + spoiler) | usuario |
| 15 | PATCH | `/reviews/{id}` | Edita a própria review (ownership) | usuario (dono) |
| 16 | DELETE | `/reviews/{id}` | Remove a própria review (ownership) | usuario (dono) |

### Listas

| # | Método | Path | Descrição | Papel mínimo |
|---|--------|------|-----------|--------------|
| 17 | GET | `/lists?user=&public=&page=` | Lista coleções (filtra públicas/privadas) | público |
| 18 | GET | `/lists/{id}` | Detalhe de uma lista e seus itens | público |
| 19 | POST | `/lists` | Cria uma lista customizada | usuario |
| 20 | PATCH | `/lists/{id}` | Edita metadados da lista (ownership) | usuario (dono) |
| 21 | DELETE | `/lists/{id}` | Exclui a lista (ownership) | usuario (dono) |
| 22 | POST | `/lists/{id}/items` | Adiciona um jogo à lista (ownership) | usuario (dono) |
| 23 | DELETE | `/lists/{id}/items/{itemId}` | Remove um jogo da lista (ownership) | usuario (dono) |

### Social (Follow + Feed)

| # | Método | Path | Descrição | Papel mínimo |
|---|--------|------|-----------|--------------|
| 24 | POST | `/users/{id}/follow` | Segue um usuário | usuario |
| 25 | DELETE | `/users/{id}/follow` | Deixa de seguir um usuário | usuario |
| 26 | GET | `/feed?page=` | Feed de atividade de quem o usuário segue | usuario |

### Wishlist

| # | Método | Path | Descrição | Papel mínimo |
|---|--------|------|-----------|--------------|
| 27 | GET | `/users/{id}/wishlist?page=` | Lista a wishlist de um usuário | público |
| 28 | POST | `/wishlist` | Adiciona jogo à própria wishlist | usuario |
| 29 | DELETE | `/wishlist/{itemId}` | Remove item da própria wishlist (ownership) | usuario (dono) |

### Perfil e Estatísticas

| # | Método | Path | Descrição | Papel mínimo |
|---|--------|------|-----------|--------------|
| 30 | GET | `/users/{id}` | Perfil público do usuário | público |
| 31 | GET | `/users/{id}/stats` | Estatísticas (horas, gêneros, top devs, atividade) | público |
| 32 | PATCH | `/users/me` | Atualiza o próprio perfil (bio, avatar) | usuario (dono) |

### Moderação

| # | Método | Path | Descrição | Papel mínimo |
|---|--------|------|-----------|--------------|
| 33 | POST | `/reports` | Denuncia conteúdo (review ou lista) | usuario |
| 34 | GET | `/moderation/reports?status=&page=` | Lista denúncias pendentes | moderador |
| 35 | PATCH | `/reviews/{id}/hide` | Oculta review reportada (soft-delete) | moderador |
| 36 | PATCH | `/users/{id}/suspend` | Suspende/bane um usuário | moderador |
| 37 | PATCH | `/users/{id}/roles` | Atribui/revoga papéis de um usuário | admin |
| 38 | PUT | `/admin/rawg-config` | Configura chave/sync da integração RAWG | admin |

### Convenções

- **Paginação**: `?page=` + `?page_size=` (default 20, máx 100); resposta inclui `count`, `next`, `previous`.
- **Auth**: header `Authorization: Bearer <jwt>`; endpoints `usuario+` retornam 401 sem token, 403 sem papel/ownership.
- **Ownership**: em recursos do usuário, 403 se o requisitante não for o dono nem moderador/admin.
- **Formato de erro**: JSON `{ "error": { "code": "...", "message": "...", "details": [] } }` com status HTTP semântico.
- **Versionamento**: prefixo `/api/v1`; mudanças incompatíveis sobem para `/api/v2`.

## Critérios de aceite

- [ ] Rotas agrupadas por recurso, com método, path, descrição e papel mínimo
- [ ] Convenções REST respeitadas (plural, sub-recursos, verbos HTTP semânticos)
- [ ] Catálogo de jogos exposto apenas como proxy read-only da RAWG
- [ ] Ownership e papéis (RBAC) explícitos nas rotas de escrita e moderação
- [ ] Paginação/filtros nas listagens
- [ ] Cobertura de auth, catálogo, biblioteca, reviews, listas, social, wishlist, perfil/stats e moderação
- [ ] API versionada sob /api/v1

---

> **Ferramenta utilizada:** Claude (Anthropic), modelo Opus 4.8.
