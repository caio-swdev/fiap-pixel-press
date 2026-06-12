# Migração de Versão e Modernização de DTOs do PixelPress — atividade-3

> **Ferramenta:** Claude (Anthropic), modelo Opus 4.8 — em Agent Mode.
>
> **Fase 2 (Execução / Transformação) — item 3 de 5.** Aqui o código **muda**. A rede de segurança é a suíte de caracterização do item 1.
>
> **Adaptação Java → TypeScript:** o item original (Java 25 + Records substituindo POJOs) vira, no nosso stack, atualização de Node/TS LTS + DTOs de resposta imutáveis e tipos concisos. O equivalente a "Record" são tipos `readonly`, **não** os DTOs de entrada validados.

## Prompt

```
Atualize o projeto PixelPress para a versão LTS mais recente do Node.js e do
TypeScript, ajustando `target` e `lib` do tsconfig para o ES mais recente
suportado e corrigindo o que a atualização quebrar. Em seguida, reduza o
boilerplate das entidades e DTOs de resposta (Usuario, Jogo, ItemBiblioteca,
Review): substitua classes e objetos verbosos e imutáveis por tipos `readonly`
concisos e por tipos derivados do Prisma quando aplicável. NÃO converta os DTOs
de entrada validados por class-validator em tipos soltos — eles permanecem
classes com decorators, conforme `.ai/standards.md`. Após cada mudança, rode a
suíte de caracterização (test/characterization): ela deve permanecer verde.
Nenhum comportamento observável pode mudar.
```

## Notas de execução (contexto para o agente, fora do prompt principal)

* **Rede de segurança:** a suíte de `prompt-1` é o critério de "não quebrou". Verde antes e depois de cada passo. Se ficar vermelha, a refatoração alterou comportamento — reverta.
* **Onde o "Record" se aplica:** DTOs de **resposta**, value objects e modelos de domínio imutáveis → tipos `readonly`. **Onde não se aplica:** DTOs de **entrada** (body de POST/PUT) → seguem `class` + `class-validator` (`whitelist`, `transform`). Misturar os dois quebra a validação global.
* **Sequência:** este item eleva o `target` do ES e habilita os métodos imutáveis usados no item 5 (`toSorted`, `Object.groupBy`, etc.). Faça antes do item 5.

## Critérios de aceite

- [ ] Node.js e TypeScript em LTS recente; `tsconfig` com `target`/`lib` modernizados; build verde
- [ ] DTOs de resposta / value objects imutáveis convertidos para tipos `readonly` concisos
- [ ] DTOs de entrada permanecem classes com `class-validator` (inalterados)
- [ ] Boilerplate de entidades reduzido sem perder tipagem
- [ ] Suíte de caracterização permanece verde
- [ ] Nenhuma mudança de comportamento observável
