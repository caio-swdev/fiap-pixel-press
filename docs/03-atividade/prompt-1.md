# Baseline de Testes de Caracterização do PixelPress — atividade-3

> **Ferramenta:** Claude (Anthropic), modelo Opus 4.8 — em Agent Mode.

## Prompt

```
Analise o projeto PixelPress no diretório `src/`, especificamente os módulos de
biblioteca pessoal e de catálogo de jogos (integração RAWG). Como não existem
testes automatizados, gere uma suíte de testes de caracterização (integração
end-to-end) usando Jest e Supertest que congele o comportamento atual do fluxo
principal: criação de um item de biblioteca e sua associação com um jogo do
catálogo, incluindo o caminho de erro de unicidade (jogo já presente na
biblioteca do usuário). Os testes devem descrever o que o sistema FAZ hoje, não
o que deveria fazer: capturem status code e corpo da resposta reais na fronteira
HTTP, mockem a RAWG por fixtures e rodem contra um banco efêmero e determinístico.
Neste momento, não altere o código, apenas os testes.
```

## Notas de execução (contexto para o agente, fora do prompt principal)

* **Pré-condição:** caracterização só existe sobre código rodando. Se o backend não estiver implementado, pare e reporte — não invente comportamento.
* **Fonte de verdade:** domínio em `01-` a `07-*.md` (raiz) e `.ai/`; comportamento real a congelar é o do código em `src/`.
* **Stack de teste aprovada:** `jest`, `ts-jest`, `@nestjs/testing`, `supertest` (não introduzir outras).
* **Determinismo:** Postgres + Redis efêmeros (Testcontainers ou compose de teste), seed fixo, RAWG nunca chamada de verdade (fixtures), tokens JWT por papel via helper.
* **Bugs encontrados:** congelar no teste e registrar em `atividade-3/caracterizacao-observacoes.md`. Não corrigir.

## Critérios de aceite

- [ ] Suíte e2e em `test/characterization/` rodando **verde** contra o sistema atual
- [ ] Fluxo principal coberto: criação de `ItemBiblioteca` + associação ao `Jogo`
- [ ] Caminho de erro de unicidade congelado (status real, ex.: 409)
- [ ] Asserções refletem o comportamento **real**, não o idealizado
- [ ] RAWG mockada por fixtures; banco efêmero e isolado entre testes
- [ ] Nenhuma alteração em código de produção (`src/`)
