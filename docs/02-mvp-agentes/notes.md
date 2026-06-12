# RAWG API — notas de uso (PixelPress)

> Referência prática para a integração do módulo `jogos/`. Fonte: docs oficiais (`https://rawg.io/apidocs`, `https://api.rawg.io/docs/`) e specs espelhados. Catálogo é **read-only**.
>
> 📖 **Documentação oficial da API:** https://api.rawg.io/docs/ (SPA Swagger/OpenAPI; schema cru em `https://api.rawg.io/docs/?format=openapi`). **API:** RAWG Video Games Database API, **versão v1.0**. Consultar para qualquer endpoint não coberto abaixo.

## 0. API Key

```
RAWG_API_KEY=dcb01d2b55784052ab16122d4f5a0c3d
```

> ⚠️ **Segredo.** Esta chave deve viver no `.env` (gitignored), não num arquivo versionado. Se o repo for público/pushed, mova para `.env`, remova daqui e **rotacione a chave** em rawg.io. Nunca exponha em logs ou respostas da API.

## 1. Base URL e autenticação

| # | Item | Valor |
|---|------|-------|
| 1 | Base URL | `https://api.rawg.io/api` |
| 2 | Autenticação | **API key como query param** `key` em **toda** requisição |
| 3 | Exemplo | `GET https://api.rawg.io/api/games?key=YOUR_API_KEY&search=zelda` |

* A chave vem do `.env` (`RAWG_API_KEY`), nunca hardcoded nem em logs/respostas.
* O método antigo de assinar via `User-Agent` está sendo descontinuado; use `key=`.

## 2. Rate limit

* Plano gratuito: ~**100 requisições/dia** (citado na atividade; a doc oficial não publica número exato, mas avisa que "bater rápido demais" causa bloqueio temporário).
* Mitigação no projeto: **cache-aside in-process** (`CacheService`, TTL `RAWG_CACHE_TTL_SECONDS=300`). Toda leitura de catálogo consulta o cache antes de chamar a RAWG.
* Plano B na demo: `USE_RAWG_MOCK=true` serve o fixture local se a chave/rede falhar.

## 3. Atribuição (OBRIGATÓRIA — requisito de licença)

> Uso gratuito permitido **desde que** se atribua a RAWG como fonte dos dados/imagens **e** se adicione um hyperlink ativo em **toda página** onde os dados da RAWG aparecem.

* Ação: incluir "Powered by RAWG" com link para `https://rawg.io` (e/ou para a página RAWG do jogo) no README e na UI futura. Registrar no README do MVP para garantir a nota.

## 4. Endpoints relevantes ao MVP

| # | Método | Path | Uso no PixelPress |
|---|--------|------|-------------------|
| 1 | GET | `/games` | Busca/listagem de catálogo |
| 2 | GET | `/games/{id}` | Detalhe (aceita **id numérico ou slug**) |
| 3 | GET | `/games/{id}/screenshots` | Screenshots (detalhe rico, sob demanda) |
| 4 | GET | `/games/{id}/movies` | Trailers (sob demanda) |
| 5 | GET | `/genres` | Lista de gêneros (filtros, opcional) |
| 6 | GET | `/platforms` | Lista de plataformas (filtros, opcional) |

`{id}` = ID numérico **ou** slug (ex.: `the-witcher-3-wild-hunt`).

## 5. `GET /games` — query params

| # | Param | Tipo | Significado |
|---|-------|------|-------------|
| 1 | `key` | str | API key (obrigatório) |
| 2 | `search` | str | Termo de busca |
| 3 | `search_precise` | bool | Desliga fuzziness da busca |
| 4 | `search_exact` | bool | Trata o termo como exato |
| 5 | `page` | int | Página (paginação) |
| 6 | `page_size` | int | Itens por página (mapear ao nosso `page_size`, máx 100) |
| 7 | `ordering` | str | `name`, `released`, `added`, `created`, `updated`, `rating`, `metacritic`; prefixe `-` para desc (ex.: `-rating`) |
| 8 | `genres` | str | IDs ou slugs de gênero (CSV) |
| 9 | `platforms` | str | IDs de plataforma (CSV) |
| 10 | `parent_platforms` | str | IDs de plataforma-pai (CSV) |
| 11 | `tags` | str | IDs ou slugs de tag |
| 12 | `developers` | str | IDs ou slugs |
| 13 | `publishers` | str | IDs ou slugs |
| 14 | `dates` | str | Faixa de lançamento, ex.: `2019-09-01,2019-09-30` |
| 15 | `updated` | str | Faixa de data de atualização |
| 16 | `metacritic` | str | Faixa Metacritic, ex.: `80,100` |
| 17 | `exclude_additions` | bool | Exclui DLC |
| 18 | `exclude_game_series` | bool | Exclui itens de série |

> Mapeamento: nosso contrato de paginação (`page`, `page_size`) casa 1:1 com o da RAWG. O envelope da RAWG (`count`/`next`/`previous`/`results`) é o mesmo formato do nosso `standards.md`, mas **re-empacote** na resposta do PixelPress, não repasse o payload cru.

## 6. Forma da resposta `/games` (campos úteis no `results[]`)

| # | Campo RAWG | Mapeia para |
|---|-----------|-------------|
| 1 | `id` | `rawgId` (persistido) |
| 2 | `slug` | `slug` (persistido) |
| 3 | `name` | `nome` (persistido) |
| 4 | `background_image` | `capaUrl` (persistido) |
| 5 | `released` | detalhe (não persistido) |
| 6 | `rating` | detalhe (não persistido) |
| 7 | `metacritic` | detalhe (não persistido) |
| 8 | `platforms[]` | detalhe (não persistido) |
| 9 | `genres[]` | detalhe (não persistido) |

Envelope: `{ "count", "next", "previous", "results": [...] }`.

> Regra do `.ai/`: persistir só `rawgId`, `slug`, `nome`, `capaUrl` (referência mínima `Jogo`, via upsert no primeiro uso). Detalhes ricos (screenshots, trailers, metacritic, plataformas) são buscados **sob demanda** e **nunca** persistidos.

## 7. Exemplos de chamada

```bash
# Busca
GET https://api.rawg.io/api/games?key=$RAWG_API_KEY&search=zelda&page=1&page_size=20&ordering=-rating

# Detalhe por slug
GET https://api.rawg.io/api/games/the-witcher-3-wild-hunt?key=$RAWG_API_KEY

# Screenshots
GET https://api.rawg.io/api/games/the-witcher-3-wild-hunt/screenshots?key=$RAWG_API_KEY
```

## 8. Tratamento de erro (no `HttpRawgClient`)

* Timeout / 4xx / 5xx da RAWG → o service lança erro mapeado pelo `ExceptionFilter` para **502 Bad Gateway**, envelope `{ "error": { "code", "message", "details" } }`.
* Nunca repassar corpo de erro cru da RAWG nem a `key` ao cliente.

## 9. Índice completo de endpoints (OpenAPI v1.0)

> Todos GET, read-only. Fora do escopo do MVP, mas catalogados para referência futura. Schema: `https://api.rawg.io/docs/?format=openapi`.

| # | Path | Recurso |
|---|------|---------|
| 1 | `/games` | Lista/busca de jogos |
| 2 | `/games/{id}` | Detalhe (id ou slug) |
| 3 | `/games/{id}/achievements` | Conquistas |
| 4 | `/games/{id}/movies` | Trailers |
| 5 | `/games/{id}/reddit` | Posts do Reddit |
| 6 | `/games/{id}/suggested` | Sugeridos (premium) |
| 7 | `/games/{id}/twitch` | Streams Twitch (premium) |
| 8 | `/games/{id}/youtube` | Vídeos YouTube (premium) |
| 9 | `/games/{game_pk}/additions` | DLCs/edições |
| 10 | `/games/{game_pk}/development-team` | Time de desenvolvimento |
| 11 | `/games/{game_pk}/game-series` | Jogos da mesma série |
| 12 | `/games/{game_pk}/parent-games` | Jogos-pai |
| 13 | `/games/{game_pk}/screenshots` | Screenshots |
| 14 | `/games/{game_pk}/stores` | Lojas |
| 15 | `/genres`, `/genres/{id}` | Gêneros |
| 16 | `/platforms`, `/platforms/{id}` | Plataformas |
| 17 | `/platforms/lists/parents` | Plataformas-pai |
| 18 | `/stores`, `/stores/{id}` | Lojas |
| 19 | `/tags`, `/tags/{id}` | Tags |
| 20 | `/developers`, `/developers/{id}` | Desenvolvedoras |
| 21 | `/publishers`, `/publishers/{id}` | Publishers |
| 22 | `/creators`, `/creators/{id}` | Criadores |
| 23 | `/creator-roles` | Papéis de criadores |

---

### Fontes
- [RAWG Video Games Database API (docs oficiais)](https://api.rawg.io/docs/)
- [Explore RAWG API (apidocs)](https://rawg.io/apidocs)
- [Spec espelhado dos endpoints (uburuntu/rawg)](https://github.com/uburuntu/rawg/blob/master/docs/GamesApi.md)
- [Padrões de chamada (rawgpy)](https://rawgpy.readthedocs.io/en/latest/_modules/rawgpy/rawg.html)
