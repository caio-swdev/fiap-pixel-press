# Mapeamento de Acoplamento e Dívida Técnica do PixelPress — atividade-3

> **Ferramenta:** Claude (Anthropic), modelo Opus 4.8 — em Agent Mode.
>
> **Fase 1 (Pré-Refatoração / Blindagem) — item 2 de 5.** Diagnóstico, não transformação. **Nenhuma linha de código de produção é alterada nesta fase.**

## Prompt

```
Analise o projeto PixelPress no diretório `src/` e produza um diagnóstico de
acoplamento e dívida técnica, sem alterar nenhum código. Mapeie o grafo de
dependências entre os módulos NestJS e identifique: dependências circulares,
serviços com responsabilidade excessiva (god services), lógica de negócio
vazando para controllers, acesso ao banco fora do PrismaService, chamadas à
RAWG fora do módulo `jogos/`, ausência de guards de RBAC/ownership e código
morto. Para cada achado, registre local (arquivo/módulo), tipo de problema,
risco para a refatoração e recomendação. Entregue um relatório em
`atividade-3/divida-tecnica.md` priorizado por risco. Não altere o código,
apenas gere o diagnóstico.
```

## Notas de execução (contexto para o agente, fora do prompt principal)

* **Régua do que é violação:** `.ai/standards.md` e `.ai/architecture.md` definem as regras (controllers finos, lógica só em services, `PrismaService` como único ponto de acesso ao banco, RAWG só no módulo `jogos/`, RBAC/ownership em guards). Tudo que destoa é dívida.
* **Ferramental de diagnóstico permitido** (somente análise, não roda em produção): `madge` ou `dependency-cruiser` (deps circulares e grafo), `ts-prune` (código morto), `eslint`. Nenhuma alteração de `src/`.
* **Complementa o item 1:** a baseline de caracterização (`prompt-1`) congela o comportamento; este mapa diz **o que** refatorar e **em que ordem de risco**. Juntos formam a blindagem antes da Fase 2.

## Critérios de aceite

- [ ] Grafo de dependências entre os módulos NestJS
- [ ] Dependências circulares listadas (ou confirmação de que não há)
- [ ] Violações de `standards.md`/`architecture.md` identificadas (lógica em controller, Prisma fora do `PrismaService`, RAWG fora de `jogos/`, guards ausentes)
- [ ] Cada achado com local, risco e recomendação
- [ ] Relatório priorizado por risco em `atividade-3/divida-tecnica.md`
- [ ] Zero alteração em código de produção (`src/`)
