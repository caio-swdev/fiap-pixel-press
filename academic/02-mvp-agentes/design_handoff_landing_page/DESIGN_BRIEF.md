# Design Brief — PixelPress Landing Page

> Este é o briefing que originou os designs deste bundle. Inclui o contexto do produto,
> as decisões de direção tomadas a partir das respostas do cliente, e o sistema visual
> resultante. Serve como o "prompt" / spec de partida para implementação.

---

## 1. Contexto do produto (do PRD original)

App web de **descoberta e tracking de video games** — um "Letterboxd para jogos".
Catálogo via **RAWG Video Games Database API** + backend próprio para dados do usuário.
Público: jogadores casuais e hardcore que querem catalogar, avaliar e descobrir jogos.

Features core do produto (auth/cadastro são pré-requisito, não feature):
- Busca de jogos (nome, gênero, plataforma, ano, tags, filtros combinados)
- Página de detalhes do jogo (screenshots, trailers, descrição, lojas, metacritic, similares)
- Biblioteca pessoal (status: jogando, zerado, quero jogar, dropei, platinado)
- Avaliação e review (nota 0–10 + texto, marcação de spoiler)
- Listas customizadas (públicas/privadas)
- Recomendações personalizadas
- Feed de lançamentos
- Perfil público com estatísticas
- Social (follow + atividade)
- Wishlist com alertas de lançamento

A landing page deve vender esse produto e levar ao cadastro.

---

## 2. Direção definida (respostas do cliente)

| Dimensão | Decisão |
|---|---|
| Ponto de partida | Do zero (sem design system pré-existente) |
| Plataforma | Web responsivo (desktop + mobile) |
| Vibe | **Dark, gamer, energético** (neon/contraste) |
| Cor de destaque | **Roxo/violeta gamer** |
| Tipografia | **Geométrica e moderna** |
| Densidade | Densa, estilo catálogo |
| Imagens | Placeholders por enquanto (cliente fornece capas reais depois) |
| Interatividade | Protótipo completo com estados |
| Variações | **Sim — variações de estilo visual geral** |
| Idioma | **Português (Brasil)** |

A pedido de "variações de estilo visual", a landing foi entregue em **2 direções completas**:
**A — Editorial** (premium, espaçosa) e **B — Arcade neon** (energética, gamer puro).

---

## 3. Sistema visual resultante (o "prompt" sintetizado)

> Desenhe uma landing page dark para o PixelPress, um tracker de games estilo Letterboxd.
> Tom **gamer e energético** com **neon roxo/violeta** como cor primária. Tipografia
> **geométrica moderna**: `Space Grotesk` para display/UI e `Space Mono` para labels técnicas
> (anos, contadores, eyebrows). Fundo near-black levemente arroxeado (`#08070C`), superfícies
> em camadas (`#100E17` / `#16131F`), texto `#F2F0F7` com secundário `#9890AB`.
>
> Acentos em **oklch/hsl de mesma família** — violeta `#A855F7`, ciano `#34E5FF` e, na
> variação arcade, magenta `#FF3D8B`. Use gradientes só nos pontos de energia (headline com
> text-clip, botões CTA, glows radiais), nunca como fundo chapado. Cantos arredondados
> generosos (18–24px nos cards), pills 30px. Glows suaves e propositais, não exagerados.
>
> Imagens de jogos são **placeholders procedurais**: gradientes radiais com matiz por jogo +
> scanlines em overlay, título no rodapé. Substituíveis por `background_image` da RAWG.
>
> Copy em **português brasileiro**, direta e com gíria de jogador onde couber ("zera fase",
> "dê play"). Estrutura de conversão clássica: hero → prova (plataformas/contadores) →
> features → como funciona → CTA final → footer com crédito à RAWG.
>
> Entregar **duas variações de estilo**: (A) editorial/premium com hero em showcase 3D de
> capas e seções limpas; (B) arcade/neon com ticker, marquee de capas, headline gigante com
> glow e bento-grid de features.

---

## 4. O que NÃO fazer
- Não usar gradiente como fundo de página inteira (apenas acentos pontuais).
- Não usar Inter/Roboto/Arial nem fontes super estilizadas.
- Não inventar números/stats de enchimento — manter só os relevantes.
- Não enviar arte de jogo protegida; usar placeholders ou RAWG oficial.
- Em produção, **escolher UMA das duas versões** e remover o seletor de comparação.

---

Veja o `README.md` deste mesmo bundle para a especificação detalhada de cada seção, tokens
exatos, medidas e interações.
