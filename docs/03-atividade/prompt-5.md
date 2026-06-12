# Modernização de Coleções e Iteração do PixelPress — atividade-3

> **Ferramenta:** Claude (Anthropic), modelo Opus 4.8 — em Agent Mode.
>
> **Fase 2 (Execução / Transformação) — item 5 de 5.** O código **muda**, protegido pela suíte de caracterização do item 1.
>
> **Adaptação Java → TypeScript:** o item original (Java Streams + Sequenced Collections) vira, no nosso stack, processamento declarativo de arrays + os métodos imutáveis recentes do ES.

## Prompt

```
Modernize o processamento de coleções no projeto PixelPress: substitua loops
`for`/`forEach` imperativos e mutações manuais por operações declarativas de
array (map, filter, reduce, flatMap) e pelos métodos imutáveis recentes
(toSorted, toReversed, Object.groupBy, at()), priorizando legibilidade e
imutabilidade. Concentre-se nas agregações de estatísticas de perfil, na
montagem do feed social e na normalização de payloads da RAWG. Após cada
mudança, rode a suíte de caracterização (test/characterization): ela deve
permanecer verde. Nenhum comportamento observável pode mudar.
```

## Notas de execução (contexto para o agente, fora do prompt principal)

* **Depende do item 3:** os métodos imutáveis (`toSorted`, `toReversed`, `Object.groupBy`, `at()`) exigem o `target`/`lib` do ES elevado pela migração. Faça o item 3 antes deste.
* **Imutabilidade real:** preferir `toSorted`/`toReversed`/`with` a `sort`/`reverse`/atribuição in-place, que mutam o array original e são fonte de bug silencioso.
* **Onde rende mais:** cálculos de estatísticas do perfil (contagens por status, médias de nota), agregação do feed social e o mapeamento do JSON cru da RAWG para a referência mínima de `Jogo`.
* **Rede de segurança:** suíte de `prompt-1` verde antes e depois. Legibilidade não justifica alterar saída — se a caracterização ficar vermelha, reverta.

## Critérios de aceite

- [ ] Loops imperativos e mutações manuais substituídos por operações declarativas
- [ ] Métodos imutáveis recentes (`toSorted`, `Object.groupBy`, etc.) usados onde aplicável
- [ ] Estatísticas de perfil, feed social e normalização da RAWG modernizados
- [ ] Legibilidade aumentada, sem mutação desnecessária
- [ ] Suíte de caracterização permanece verde
- [ ] Nenhuma mudança de comportamento observável
