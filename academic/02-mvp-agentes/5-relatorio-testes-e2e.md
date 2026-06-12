# Relatório de testes E2E — MVP PixelPress (atividade-2)

Execução do plano `4-prompt-de-plano-de-testes.md`. Duas suítes E2E, ambas verdes a
partir de `pnpm test:all`, sem Docker e **sem nenhuma chamada à RAWG real**
(`USE_RAWG_MOCK=true` forçado) e sem tocar o `dev.db` (bancos de teste isolados).

```
Camada A (API, Jest + Supertest):  7 suites, 52/52 testes  ✅
Camada B (UI, Playwright):         9 fluxos, 9/9           ✅
```

## Como rodar

```bash
cd src
pnpm install
pnpm --filter pixelpress-frontend exec playwright install chromium
pnpm test:all          # API e2e + UI e2e em sequência
# ou separadamente:
pnpm test:e2e:api      # só a API
pnpm test:e2e:ui       # só a UI (sobe API :3333 + vite :4173 automaticamente)
```

## Camada A — cobertura das 21 rotas (52 casos)

| # | Rota | Spec | Resultado |
|---|------|------|-----------|
| 1 | `POST /auth/register` | auth (201, dup 409, inválido 400) | ✅ |
| 2 | `POST /auth/login` | auth (200, senha errada 401, inativo 401) | ✅ |
| 3 | `POST /auth/refresh` | auth (200, tipo errado 401, malformado 400) | ✅ |
| 4 | `GET /usuarios/me` | usuarios / rbac (200, sem token 401) | ✅ |
| 5 | `PATCH /usuarios/me` | usuarios (200 + persistido) | ✅ |
| 6 | `GET /usuarios` | usuarios / rbac (admin 200, usuário 403) | ✅ |
| 7 | `GET /usuarios/:id` | usuarios (200) | ✅ |
| 8 | `PATCH /usuarios/:id/papel` | usuarios (admin muda papel, usuário 403) | ✅ |
| 9 | `GET /games` | catalogo (200, paginação, cache miss→hit, 502) | ✅ |
| 10 | `GET /games/:slug` | catalogo (200 + detalhe) | ✅ |
| 11 | `POST /biblioteca` | biblioteca (201, dup 409, enum inválido 400) | ✅ |
| 12 | `GET /biblioteca/me` | biblioteca (200, itens do usuário) | ✅ |
| 13 | `PATCH /biblioteca/:id` | biblioteca (dono 200, outro 403) | ✅ |
| 14 | `DELETE /biblioteca/:id` | biblioteca (dono 204, outro 403) | ✅ |
| 15 | `GET /reviews` | reviews (200, ocultas excluídas) | ✅ |
| 16 | `POST /reviews` | reviews (201, nota 11 → 422, dup 409) | ✅ |
| 17 | `PATCH /reviews/:id` | reviews (dono 200, outro 403) | ✅ |
| 18 | `DELETE /reviews/:id` | reviews (dono 204, outro 403) | ✅ |
| 19 | `PATCH /reviews/:id/hide` | moderacao (moderador 200, usuário 403) | ✅ |
| 20 | `POST /reports` | moderacao (201 PENDENTE, inexistente 404) | ✅ |
| 21 | `GET /moderation/reports` | moderacao / rbac (moderador 200, usuário 403) | ✅ |

Extras verificados: envelope de erro `{ error: { code, message, details } }` em todo
caminho de falha; **cache miss→hit** asserido por spy no `RawgClient` (2ª busca não
chama o client); **upsert** da referência mínima `Jogo` conferido no banco; **502**
simulado por stub que lança `RawgIndisponivelException` (sem rede, chave nunca vaza);
matriz **RBAC** consolidada (`ADMIN ⊇ MODERADOR ⊇ USUARIO`).

## Camada B — 9 fluxos de UI

| # | Fluxo | Spec | Resultado |
|---|-------|------|-----------|
| 1 | Cadastro → autentica → catálogo | cadastro | ✅ |
| 2 | Landing → login → catálogo | login | ✅ |
| 3 | Buscar → abrir detalhe | catalogo | ✅ |
| 4 | Biblioteca: adicionar, editar, remover | biblioteca | ✅ |
| 5 | Reviews: criar, editar, excluir | reviews | ✅ |
| 6 | Denunciar review de outro | denuncia | ✅ |
| 7 | Moderação: ocultar pendente | moderacao | ✅ |
| 8 | Admin: atribuir papel | admin | ✅ |
| 9 | Guards: usuário bloqueado de /moderacao e /admin | guards | ✅ |

## Divergências do plano (o código venceu, conforme o contrato)

| # | Plano dizia | Realidade no código | Ajuste |
|---|-------------|---------------------|--------|
| 1 | register/enum inválido → 422 | `ValidationPipe` → **400**; 422 só para regra de negócio (nota) | testes assertam 400 |
| 2 | catálogo e escrita exigem token | `GET /games` e `GET /reviews` **não têm guard** (públicos) | "sem token → 401" cobre só biblioteca/reviews-write/usuarios/moderação |
| 3 | register → login na UI | frontend **não tinha tela de cadastro** | construída a `RegisterPage` (Fase 0.5) e testada |

## Decisões de teste

1. **Mock RAWG forçado** em 100% das duas suítes; o 502 é simulado por stub, não por rede.
2. **Bancos isolados:** API e2e usa `test.db`; UI e2e usa `test-e2e.db`. Nenhum toca `dev.db`. Re-seed determinístico (4 usuários, 4 jogos, 2 reviews, 1 denúncia) por arquivo (API) / por boot do servidor (UI).
3. **Cache** asserido por `jest.spyOn` no `RawgClient`; **upsert** conferido lendo o banco direto.
4. **Seletores de UI** por papel/rótulo (`getByRole`, `getByLabel`); `data-testid` inertes em `LibraryPage` e `ReviewCard` para desambiguar linhas/reviews repetidas, sem alterar comportamento.

## Dificuldades encontradas (para a apresentação)

1. **ESM no Playwright config:** o pacote web é `"type": "module"`, então `__dirname` não existe — resolvido via `fileURLToPath(import.meta.url)`.
2. **`testMatch`:** specs nomeados `*.e2e.ts` não batem no padrão padrão (`*.spec/test.ts`); precisou de `testMatch` explícito.
3. **Strict-mode locators:** `getByRole('button', { name: 'Adicionar' })` casava também com "+ Adicionar à biblioteca"; resolvido com `exact: true`.
4. **Erro pré-existente fora do escopo:** `LandingPage.tsx` tem um `FEATURE_MAP` não usado que quebra `tsc --noEmit` (e portanto `pnpm build:web`). Não foi alterado (é trabalho em andamento da landing); a suíte E2E usa o **vite dev server**, que não passa pelo `tsc`, então não bloqueia os testes. Fica registrado para correção à parte.
