# Refatoração de Domínio (Desacoplamento) do PixelPress — atividade-3

> **Ferramenta:** Claude (Anthropic), modelo Opus 4.8 — em Agent Mode.
>
> **Fase 2 (Execução / Transformação) — item 4 de 5.** O código **muda**, protegido pela suíte de caracterização do item 1.

## Prompt

```
Refatore o projeto PixelPress para separar as regras de negócio das camadas de
persistência (Prisma) e apresentação (controllers HTTP). Extraia validações de
domínio e cálculos — nota de review 0–10, enum de status de biblioteca, regras
de unicidade e ownership, estatísticas de perfil — para serviços de domínio
puros, sem dependência de Prisma, HTTP ou Redis. O acesso a dados deve ficar
atrás de uma abstração de repositório; os controllers permanecem finos. Após
cada mudança, rode a suíte de caracterização (test/characterization): ela deve
permanecer verde. Nenhum comportamento observável pode mudar.
```

## Notas de execução (contexto para o agente, fora do prompt principal)

* **Fonte das regras:** `.ai/business-rules.md` lista o que é regra de domínio (faixas, enums, unicidade, ownership, visibilidade, fluxo de moderação). É isso que vira função/serviço de domínio puro e testável isoladamente.
* **Pureza:** serviço de domínio não importa Prisma, nem `Request`/`Response`, nem `ioredis`. Recebe dados, devolve decisão/resultado. A orquestração (buscar no repositório, aplicar a regra, persistir) fica no service de aplicação do módulo.
* **Ownership e RBAC** continuam aplicados (guards + service), mas a **lógica da regra** vira pura; o guard/serviço apenas a invoca.
* **Rede de segurança:** suíte de `prompt-1` verde antes e depois. Desacoplamento que muda status code ou shape de resposta não é refatoração — é mudança de comportamento; reverta.

## Critérios de aceite

- [ ] Validações e cálculos em serviços de domínio puros (sem Prisma/HTTP/Redis)
- [ ] Acesso a dados atrás de abstração de repositório
- [ ] Controllers permanecem finos (sem lógica de negócio)
- [ ] Serviços de domínio testáveis isoladamente
- [ ] Suíte de caracterização permanece verde
- [ ] Nenhuma mudança de comportamento observável
