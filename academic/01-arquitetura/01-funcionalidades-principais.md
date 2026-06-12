# Item 1 — Funcionalidades Principais

## Prompt

```
Você é um arquiteto de software trabalhando na Phase A/B do TOGAF ADM.

Contexto:
- Domínio: app web de descoberta e tracking de video games (estilo Letterboxd para jogos).
- Fonte de catálogo: RAWG Video Games Database API (https://rawg.io/apidocs).
- Público: jogadores casuais e hardcore que querem catalogar, avaliar e descobrir jogos.

Tarefa:
Liste cerca de 10 funcionalidades principais (features core) do sistema.
Para cada uma, escreva 1 frase curta explicando o que a feature faz e o valor que entrega ao usuário.
Foque em features viáveis de implementar consumindo a RAWG API + um backend próprio para dados do usuário.
Não inclua features de infraestrutura (login, cadastro, etc.) na lista principal, trate isso como pré-requisito.

Formato de saída: lista Markdown, cada item no formato `- **Nome da feature**: descrição em 1 frase`.
```

## Output (rascunho, validar e refinar com a ferramenta)

- **Busca de jogos**: pesquisa no catálogo RAWG por nome, gênero, plataforma, ano e tags com filtros combinados.
- **Página de detalhes do jogo**: exibe screenshots, trailers, descrição, requisitos, lojas, metacritic e jogos similares.
- **Biblioteca pessoal**: marca cada jogo com status (jogando, zerado, quero jogar, dropei, platinado).
- **Avaliação e review**: permite nota 0-10 e texto livre, com possibilidade de marcar como spoiler.
- **Listas customizadas**: cria coleções temáticas (ex: "RPGs favoritos 2025", "para zerar nas férias") públicas ou privadas.
- **Recomendações personalizadas**: sugere jogos baseado em gêneros, plataformas e desenvolvedores presentes na biblioteca do usuário.
- **Feed de lançamentos**: mostra jogos lançados recentemente e próximos releases filtrados por plataformas que o usuário possui.
- **Perfil público com estatísticas**: página pública do usuário com horas estimadas, gêneros mais jogados, top desenvolvedores e gráfico de atividade.
- **Social (follow + atividade)**: seguir outros usuários e ver no feed o que amigos zeraram, avaliaram ou adicionaram à wishlist.
- **Wishlist com alertas de lançamento**: marca jogos não lançados e notifica quando data de release fica próxima ou muda.

## Critérios de aceite

- [ ] ~10 features listadas (entre 8 e 12 aceitável)
- [ ] Cada feature é implementável combinando RAWG API + backend próprio
- [ ] Nenhuma feature depende de integração externa não documentada
- [ ] Funcionalidades de auth/cadastro tratadas como pré-requisito, não como feature core

---

> **Ferramenta utilizada:** Claude (Anthropic), modelo Opus 4.8.
