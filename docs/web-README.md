# PixelPress — Frontend (SPA)

Camada de apresentação do PixelPress: uma SPA React + TypeScript que consome o backend
já entregue em `/api/v1`. **Não reimplementa regra de negócio** — espelha na UI as permissões
e validações que o backend impõe (RBAC, ownership, faixa de nota, unicidade, moderação).

> A SPA só conversa com `http://<host>/api/v1`. Nunca chama a RAWG direto, nunca acessa banco.
> A `RAWG_API_KEY` jamais aparece no frontend.

---

## Stack

React 18 · TypeScript 5 (`strict`) · Vite 6 · React Router 6 · TanStack Query 5 · Axios ·
React Hook Form + Zod · Tailwind CSS. UI primitives próprias (button, input, select, modal,
toast, badge, table) — ver [desvios](#desvios-conscientes).

---

## Pré-requisitos

1. **Node 18+** e **pnpm**.
2. **Backend rodando** (na raiz do repositório):
   ```bash
   # na raiz do repo
   pnpm install
   pnpm start:dev            # sobe o backend em :3000 (ou :3100 se a 3000 estiver ocupada)
   ```
   Para demo offline (sem chave RAWG), o backend usa o catálogo mock — basta `USE_RAWG_MOCK=true`
   no `.env` da raiz (já é o default desta demo). Credenciais do seed abaixo.

---

## Executar

```bash
cd frontend
cp .env.example .env       # ajuste VITE_PROXY_TARGET para a porta do backend
pnpm install
pnpm dev                   # http://localhost:5173
```

Scripts: `pnpm dev` · `pnpm build` (typecheck + bundle) · `pnpm preview` · `pnpm typecheck`.

---

## Configuração (`.env`)

| Variável | Default | Para que serve |
|----------|---------|----------------|
| `VITE_API_BASE_URL` | `/api/v1` | Base da API que o axios usa. Em dev é **relativa** (same-origin) e passa pelo proxy. Em produção, aponte para a URL absoluta do backend (com CORS). |
| `VITE_PROXY_TARGET` | `http://localhost:3000` | **Origem** do backend para onde o Vite faz proxy de `/api` em dev. Ajuste a porta aqui (ex.: `3100`), **nunca** hardcode no código. |

### Por que o proxy?

O backend entregue **não habilita CORS**. Para falar com ele a partir do browser **sem tocar no
backend**, o dev server do Vite faz proxy de `/api` → `VITE_PROXY_TARGET`. Assim a SPA chama
same-origin (`/api/v1/...`) e o Vite encaminha server-side, eliminando o erro de CORS.
Em produção com CORS habilitado, basta apontar `VITE_API_BASE_URL` direto para o backend.

> Atenção à porta: nesta demo o backend subiu em **:3100** (a 3000 estava ocupada). Só o `.env`
> conhece a porta — o código lê tudo da env.

---

## Credenciais do seed

Senha de todos: **`Senha@123`**

| E-mail | Papel | Observação |
|--------|-------|------------|
| `admin@pixelpress.dev` | ADMIN | vê tudo (Catálogo, Biblioteca, Moderação, Admin) |
| `moderador@pixelpress.dev` | MODERADOR | vê Moderação |
| `usuario@pixelpress.dev` | USUARIO | biblioteca/reviews próprios |
| `inativo@pixelpress.dev` | USUARIO (inativo) | login falha com 401 |

A tela de login traz **atalhos** que preenchem cada credencial com um clique.

---

## Telas

- **Login** — credenciais do seed, guarda de rota privada, sessão persistida, logout.
- **Catálogo** (`/catalogo`) — busca paginada (debounced), grid de cards.
- **Detalhe** (`/jogo/:slug`) — capa, descrição, metacritic, rating, gêneros, plataformas,
  screenshots; adicionar à biblioteca; reviews (criar/editar/excluir a própria, denunciar, ocultar).
- **Biblioteca** (`/biblioteca`) — minha biblioteca, editar status/horas, remover.
- **Moderação** (`/moderacao`, MODERADOR+) — denúncias pendentes, ocultar review.
- **Admin** (`/admin/usuarios`, ADMIN) — lista de usuários, atribuição de papel.

RBAC na UI é **cosmético** (UX): esconder/desabilitar ação melhora a experiência, mas a
autorização real é sempre do backend.

---

## Tratamento de erro

Centralizado no interceptor do axios: o envelope `{ error: { code, message, details } }` é
normalizado num `ApiError` e exibido via toast. Códigos de domínio (`REVIEW_DUPLICADA`,
`ITEM_BIBLIOTECA_DUPLICADO`, `NOTA_INVALIDA`, `OWNERSHIP_NEGADO`, …) ganham mensagens amigáveis.
Em `401`, o cliente tenta `POST /auth/refresh` uma vez; falhando, encerra a sessão.

---

## Desvios conscientes

1. **Stack de frontend** formalizada aqui (puxada de `1-Arquitetura/06-tecnologias.md`): React +
   TS + Tailwind. O `tech-stack.md` é backend-only.
2. **JWT em `localStorage`** (access + refresh), apenas nesta demo MVP. Cookie `httpOnly` seria o
   ideal de produção, mas exigiria ajuste de CORS/credenciais no backend já entregue.
3. **Layout `frontend/`** ao lado de `src/` (backend). Projetos independentes, risco zero para o
   backend testado.
4. **UI primitives próprias** em vez do scaffold do shadcn/ui CLI (que é interativo): button, input,
   select, modal, toast, badge e table foram escritos à mão com Tailwind, no mesmo espírito (Radix
   é a base do shadcn; aqui o conjunto é mínimo e sob controle total). Nenhuma dependência fora da
   lista aprovada foi adicionada.
5. **Proxy do Vite** para `/api` em dev, contornando a ausência de CORS no backend sem tocá-lo.

Fora do escopo (espelha o backend): `listas`, `social` (follow/feed), `wishlist`.
