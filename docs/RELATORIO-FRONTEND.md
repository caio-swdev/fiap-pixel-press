# Relatório Final — Frontend MVP PixelPress (atividade-2)

SPA React/TS (`strict`, sem `any`) consumindo o backend real `/api/v1`. Camada de apresentação
pura: nenhuma regra de negócio reimplementada, nenhuma chamada à RAWG, nenhum acesso a banco.

---

## 1. Telas, hooks e componentes

### Telas (`src/pages`)
| # | Tela | Rota | Entrega |
|---|------|------|---------|
| 1 | Login | `/login` | atalhos das 4 credenciais do seed, erro inline, redirect ao destino |
| 2 | Catálogo | `/catalogo` | busca debounced (`page`/`page_size`), grid, paginação |
| 3 | Detalhe | `/jogo/:slug` | capa, descrição, metacritic, rating, gêneros, plataformas, screenshots; add biblioteca; reviews |
| 4 | Biblioteca | `/biblioteca` | minha biblioteca, editar status/horas, remover |
| 5 | Moderação | `/moderacao` (MOD+) | denúncias pendentes, ocultar review |
| 6 | Admin | `/admin/usuarios` (ADMIN) | tabela de usuários, atribuir papel |
| 7 | 404 | `*` | not found |

### Hooks de dados (`src/hooks`, TanStack Query)
`useGames`, `useGameDetail` · `useMinhaBiblioteca`, `useAddBiblioteca`, `useUpdateBiblioteca`,
`useRemoveBiblioteca` · `useReviews`, `useCreateReview`, `useEditReview`, `useDeleteReview` ·
`useReports`, `useReport`, `useHideReview` · `useUsuarios`, `useAtribuirPapel`.

### Camada de dados (`src/api`)
- `http.ts` — axios único: baseURL da env, interceptor de Bearer, normalização do envelope de
  erro + toast central, refresh single-flight em 401.
- `endpoints.ts` — funções tipadas por recurso (única ponte hooks→axios).
- `errors.ts` — `ApiError` + mapa de `code`→mensagem amigável.
- `types.ts` — tipos do domínio em português, espelhando os DTOs/respostas do backend.
- `session-store.ts` — fonte de verdade da sessão fora do React (para o interceptor).

### Componentes
`AppShell` (header com nome+papel+logout, nav por RBAC), `GameCard`, `ReviewCard`, e os primitives
`ui/` (Button, Field/Input/Select/Textarea, Badge/Role/Status, Modal, Toast, States, Pagination).
Auth: `SessionProvider` + `temPapel`, guardas `RequireAuth`/`RequireRole`.

### Fora do MVP (espelha o backend)
`listas`, `social` (follow/feed), `wishlist`. Sem SSR, realtime ou testes nesta fase.

---

## 2. Desvios conscientes

1. Stack de frontend formalizada (React+TS+Tailwind), puxada de `06-tecnologias.md` — `tech-stack.md` é backend-only.
2. JWT em `localStorage` (access+refresh) — só na demo; cookie `httpOnly` exigiria CORS no backend.
3. Layout `frontend/` ao lado de `src/` — projetos independentes, risco zero para o backend.
4. **UI primitives próprias** em vez do shadcn CLI (interativo): conjunto mínimo Tailwind, controle total, zero deps fora da lista aprovada.
5. **Proxy do Vite** (`/api`→`VITE_PROXY_TARGET`): o backend entregue não habilita CORS; o proxy permite o browser falar com ele em dev **sem tocar no backend**. Em produção, `VITE_API_BASE_URL` aponta direto (com CORS).

Impacto: nenhum no backend (intocado). A SPA continua lendo a porta só da env.

---

## 3. Resultado dos 10 cenários (Definition of Done) — verificados no browser, backend real

| # | Cenário | Resultado |
|---|---------|-----------|
| 1 | Login seed (`usuario`) | ✅ entra; header mostra "Ursula Usuária" + badge USUARIO |
| 2 | Login inativo | ✅ falha com **"Credenciais inválidas."** (401) |
| 3 | Catálogo | ✅ busca "witcher" → 1 resultado real; card abre detalhe rico |
| 4 | Biblioteca | ✅ "minha biblioteca" lista os itens do seed com status/horas |
| 5 | Unicidade | ✅ re-adicionar Witcher → toast **"Este jogo já está na sua biblioteca."** (409) |
| 6 | Review inválida | ✅ nota 11 → toast **"A nota precisa ser um número inteiro de 0 a 10."** (422), tela intacta |
| 7 | Ownership | ✅ review própria marcada "você" com Editar/Excluir; de terceiros só Denunciar/Ocultar |
| 8 | Sessão | ✅ reload mantém sessão; logout volta ao login; rota privada sem sessão redireciona |
| 9 | RBAC visível | ✅ `usuario` sem Moderação/Admin; `moderador` vê Moderação; `admin` vê ambos |
| 10 | Moderação | ✅ moderador oculta a review denunciada → some da listagem pública (Reviews 0); fila fica limpa |

Extra verificado: atribuição de papel (Admin) — promover Ursula a MODERADOR refletiu na tabela.

---

## 4. Decisões não explícitas nas fontes

- **Tipos do domínio à mão** espelhando os DTOs (em vez de `openapi-typescript`): o backend rodava
  com mock e os shapes foram confirmados batendo na API viva (`/games`, `/reviews`, `/biblioteca/me`,
  `/moderation/reports`). Mantém tipagem ponta-a-ponta sem etapa de codegen.
- **Mapa `code`→mensagem amigável** centralizado; `NAO_AUTENTICADO` **não** é remapeado para preservar
  o "Credenciais inválidas." do backend no login (sessão expirada é tratada à parte no interceptor).
- **Toast central no interceptor** com flag `silent` para telas que tratam o erro inline (login).
- **Refresh single-flight**: 401 concorrentes compartilham uma única chamada a `/auth/refresh`.
- **Sem `max` nativo no input de nota**: travar `max=10` no HTML bloquearia o submit e impediria
  demonstrar o 422 — a faixa é regra de negócio do backend, não do client.

---

## 5. Dificuldades com o agente (para a apresentação)

- **CORS x backend intocável**: o backend não habilita CORS, então o browser bloqueava as chamadas
  (axios via "network error", sem `response`). Resolvido com **proxy do Vite** — solução 100%
  frontend, sem alterar o backend.
- **Submit silenciosamente bloqueado**: o formulário de review não enviava e nenhum request saía.
  Diagnóstico (via DevTools/fiber e network): o `<input type=number max=10>` com valor 11 disparava a
  **validação nativa de constraint do HTML5**, que cancela o submit antes de qualquer evento — RHF
  nunca rodava. Remover o `max` nativo corrigiu e habilitou a demo do 422.
- **Estabilidade do dev server em background**: precisei `disown` o processo do Vite para não ser
  reciclado entre passos da automação.

---

## Status

`pnpm build` limpo (tsc strict + bundle). 10/10 cenários da DoD verificados no browser contra o
backend real (RAWG mock, porta 3100). Aguardando próximas instruções.
