# Handoff: PixelPress — Landing Page (2 versões)

## Overview
Landing page de marketing para o **PixelPress**, um app web de descoberta e tracking de
video games ("Letterboxd para jogos"), com catálogo baseado na RAWG Video Games Database
API. Objetivo da página: converter visitantes em cadastros, comunicando os recursos core
(biblioteca com status, avaliações, listas, wishlist, recomendações, estatísticas).

Há **duas direções visuais completas** na mesma página, alternáveis por um seletor flutuante
(apenas ferramenta de comparação — em produção, escolha UMA das versões):

- **Versão A — "Editorial"**: clean, espaçosa, premium. Hero com showcase 3D de capas.
- **Versão B — "Arcade neon"**: energética, gamer. Ticker, glow neon, bento-grid.

## About the Design Files
O arquivo neste bundle (`Pixel Press Landing.dc.html`) é uma **referência de design feita em
HTML** — um protótipo que demonstra aparência e comportamento pretendidos, **não** código de
produção para copiar diretamente. Ele roda num runtime proprietário ("Design Components"):
ignore o wrapper `<x-dc>`/`support.js` e a classe `Component`; o que importa é a **estrutura
visual, os tokens, a copy e as interações** descritos abaixo.

A tarefa é **recriar este design no ambiente do codebase de destino** (React, Vue, Svelte,
etc.), usando os padrões, o design system e as bibliotecas já estabelecidos lá. Se ainda não
houver ambiente, escolha o framework mais apropriado (recomendado: **React + Tailwind** ou
CSS Modules) e implemente os designs nele.

## Fidelity
**High-fidelity (hifi).** Cores, tipografia, espaçamentos e interações são finais. Recrie a UI
o mais fiel possível usando os componentes/utilitários do codebase. As únicas exceções são as
**capas e screenshots de jogos**, que são placeholders procedurais (gradientes gerados por
código) — em produção, substitua por imagens reais vindas da RAWG API (`background_image`).

---

## Design Tokens

### Cores — base (compartilhada pelas duas versões)
| Token | Hex | Uso |
|---|---|---|
| `--bg` | `#08070C` | Fundo da página (near-black roxo) |
| `--surface` | `#100E17` | Cards de feature |
| `--surface-2` | `#16131F` | Inputs, botões secundários |
| `--surface-3` | `#130E15` | Cards do bento (versão B) |
| `--text` | `#F2F0F7` | Texto principal |
| `--muted` | `#9890AB` | Texto secundário |
| `--faint` | `#615A75` | Legendas mono, labels |
| `--line` | `rgba(255,255,255,0.06–0.08)` | Bordas sutis |

### Cores — acento por versão
| Token | Versão A | Versão B |
|---|---|---|
| Primária | `#A855F7` (violeta) | `#FF3D8B` (magenta) |
| Secundária | `#34E5FF` (ciano) | `#34E5FF` (ciano) |
| Terciária | — | `#A855F7` (violeta) |
| Gradiente CTA | `#A855F7` sólido | `linear-gradient(120deg,#FF3D8B,#A855F7)` |
| Gradiente headline | `linear-gradient(110deg,#A855F7,#34E5FF)` (text-clip) | headline branca + palavra-chave `#FF3D8B` com `text-shadow:0 0 36px rgba(255,61,139,0.6)` |

### Cores de status (chips/badges — reaproveitadas do app)
`jogando #5B8CFF` · `zerado #3DDC84` · `quero jogar #A855F7` · `dropei #FF6B6B` · `platinado #F5C451`

### Tipografia
- **Display / UI**: `'Space Grotesk'`, weights 400/500/600/700 (Google Fonts).
- **Mono / labels técnicas**: `'Space Mono'`, weights 400/700 (Google Fonts).
- Headline hero: `clamp(40px,5vw,64px)` (A) / `clamp(46px,8vw,104px)` (B), weight 700,
  `line-height:0.92–1.02`, `letter-spacing:-0.035em a -0.04em`.
- Section title: `clamp(28px,3.5vw,44px)`, weight 700, `letter-spacing:-0.03em`.
- Body: 15–18px, `line-height:1.55–1.6`, cor `--muted`.
- Labels mono: 11–12px, `letter-spacing:0.14–0.2em`, uppercase.

### Spacing / shape
- Padding horizontal das seções: `6vw` (max-width do conteúdo: 1240–1320px, centralizado).
- Padding vertical das seções: 70–100px.
- Border-radius: cards 18–24px · botões 10–13px · chips/pills 30px · badges 20px.
- Gap de grids: 16–18px.

### Shadows / glow
- Botão CTA (A): `0 14px 34px -12px rgba(168,85,247,0.7)`.
- Botão CTA (B): `0 16–18px 40–44px -12px rgba(255,61,139,0.7)`.
- Cards showcase (A): `0 24px 50px -18px rgba(0,0,0,0.8)`.
- Glow radial atrás do hero (B): `radial-gradient(circle, rgba(168,85,247,0.28), transparent 65%)` + `filter:blur(28px)`.

---

## Screens / Views

> É **uma única landing page**, em duas variações. Implemente as duas como temas/rotas
> separadas, ou escolha uma. O seletor flutuante (`Versão A / Versão B`) é só para comparação
> e **não deve ir para produção**.

### Seletor de versão (somente design)
Pill fixo, `bottom:22px`, centralizado (`left:50%; translateX(-50%)`), `z-index:100`.
Fundo `rgba(16,14,23,0.92)` + `backdrop-filter:blur(14px)`, borda 1px branca 10%, radius 40px.
Botão ativo: fundo `linear-gradient(120deg,#A855F7,#FF3D8B)`, texto branco. Remover em prod.

---

### VERSÃO A — Editorial

**1. Navbar** (sticky, top:0, z:50)
- Fundo `rgba(8,7,12,0.8)` + `backdrop-filter:blur(16px)`, borda inferior 1px branca 6%.
- Padding `18px 6vw`. Layout: logo à esquerda, links + CTAs à direita (flex, gap 30px).
- Logo: quadrado 32px radius 9px, `linear-gradient(140deg,#A855F7,#5b1f86)`, glow violeta,
  com mini-quadrado branco 12px centralizado. Texto: `PIXEL` + `PRESS` (PRESS em `#A855F7`).
- Links (`Descobrir`, `Listas`, `Comunidade`): 14px, cor `--muted`, hover → `--text`.
- `Entrar`: texto branco weight 500. `Criar conta`: botão `#A855F7`, texto `#0b0911`,
  padding `9px 18px`, radius 10px.

**2. Hero** (grid 2 colunas `1.05fr 0.95fr`, gap 40px, padding `70px 6vw 80px`)
- *Coluna esquerda*:
  - Eyebrow pill: `rgba(168,85,247,0.12)` + borda violeta 28%, radius 30px, texto `#C77DFF`
    12.5px, com dot 7px `#A855F7` (glow). Texto: "O diário dos seus games".
  - H1: "Todo jogo que você jogou, **num só lugar.**" — a frase final tem
    `background:linear-gradient(110deg,#A855F7,#34E5FF)` + `-webkit-background-clip:text`.
  - Parágrafo (`--muted`, 17.5px, max-width 480px): "Catalogue, avalie e descubra games num
    catálogo de +800 mil títulos. Marque o que está jogando, dê notas, monte listas e
    acompanhe lançamentos."
  - CTAs: `Começar grátis` (botão violeta sólido, 14px 26px) + `▶ Ver demo` (surface-2,
    borda branca 10%).
  - Stat row (3 itens, gap 34px): `800k+` / "jogos no catálogo" · `5` / "status de tracking"
    · `RAWG` / "base de dados". Número 25px weight 700, label 12.5px `--faint`.
- *Coluna direita — Showcase 3D*:
  - Container `height:480px; perspective:1400px`. Grid interno 3 colunas, gap 16px,
    `transform:rotateY(-18deg) rotateX(6deg) rotateZ(2deg); transform-style:preserve-3d`.
  - 6 cards de capa (aspect-ratio 3/4, radius 13px), cada um com `animation: float`
    (translateY ±12px, durações 3.4–5.0s escalonadas, delays 0–1.25s).
  - Cada card: gradiente procedural (ver "Capas"), overlay de scanlines, título do jogo no
    rodapé (12px weight 700, text-shadow). Jogos mostrados: Elden Ring, Hades, Hollow Knight,
    Celeste, Baldur's Gate 3, Stardew Valley.

**3. Faixa de plataformas** (borda top+bottom 1px branca 6%, padding `24px 6vw`, centralizado)
- Label mono "CATÁLOGO DE TODAS AS PLATAFORMAS" + tags mono: `PC PS5 XBOX SWITCH MOBILE`
  (14px weight 700, cor `--muted`, gap 30px).

**4. Features** (padding `90px 6vw`, max-width 1280px)
- Cabeçalho centralizado: label mono "RECURSOS" (`#A855F7`) + H2 "Tudo que um jogador-
  arquivista precisa" (`clamp(30px,3.5vw,42px)`).
- Grid `repeat(auto-fit,minmax(260px,1fr))`, gap 18px. 4 cards (`--surface`, borda branca 7%,
  radius 18px, padding `28px 24px`, hover → borda violeta 30% + `translateY(-4px)`):
  - Ícone 46px radius 12px com fundo tonal + emoji. Título 18px weight 700. Body 14.5px `--muted`.
  - **Biblioteca pessoal** (fundo ícone `rgba(91,140,255,0.16)`): "Marque cada jogo como jogando,
    zerado, platinado, dropei ou quero jogar."
  - **Avaliações & reviews** (`rgba(245,196,81,0.16)`): "Notas de 0 a 10 e texto livre, com
    opção de marcar como spoiler."
  - **Listas & wishlist** (`rgba(168,85,247,0.16)`): "Monte coleções temáticas e receba alerta
    quando o lançamento chega."
  - **Perfil com estatísticas** (`rgba(61,220,132,0.16)`): "Gêneros mais jogados, top estúdios
    e gráfico de atividade."

**5. Como funciona** (padding `30px 6vw 90px`, max-width 1100px)
- Card grande `linear-gradient(160deg,#15121F,#0c0a12)`, borda branca 7%, radius 24px,
  padding `52px 48px`. H2 centralizado "Comece em 3 passos".
- Grid de 3 passos (`auto-fit,minmax(220px,1fr)`, gap 34px). Cada passo: badge numérico 34px
  radius 9px `#A855F7` texto `#0b0911`; título 17px; body 14px `--muted`.
  - 1 "Busque no catálogo" · 2 "Adicione à biblioteca" · 3 "Avalie e compartilhe".

**6. CTA final** (centralizado, max-width 760px, padding `40px 6vw 100px`)
- H2 "Pronto para catalogar sua coleção?" (`clamp(32px,4.5vw,52px)`). Sub: "Grátis para
  sempre. Sem cartão de crédito." Botão violeta "Criar minha conta" (16px 34px).

**7. Footer** (borda top 1px branca 6%, padding `34px 6vw`, space-between)
- Logo textual + nota mono "Dados de jogos via RAWG API · © 2026".

---

### VERSÃO B — Arcade neon

**1. Ticker** (overflow hidden, fundo `#0b0910`, borda inferior branca 7%, padding `9px 0`)
- Faixa de títulos de jogos em loop infinito (`animation: marquee 28s linear`, conteúdo
  duplicado para loop sem emenda). Cada item: título mono 12px `--muted` + losango `◆`
  `#FF3D8B`, gap 18px.

**2. Navbar** (não-sticky, padding `18px 6vw`, space-between)
- Logo (gradiente `#FF3D8B→#A855F7`, glow magenta). Botão `ENTRAR ▸` outline magenta
  (borda + texto `#FF3D8B`), hover → preenche `#FF3D8B` com texto `#0b0911`.

**3. Hero** (centralizado, padding `64px 6vw 50px`, `position:relative`)
- Glow radial atrás (absolute, 620px largura, `radial-gradient(circle,rgba(168,85,247,0.28),
  transparent 65%)`, `blur(28px)`, `animation: glow 4s` pulsando opacidade 0.5↔1).
- Eyebrow pill outline magenta 35%, fundo `rgba(255,61,139,0.08)`, mono "★ SEU BACKLOG,
  ORGANIZADO".
- H1 gigante (`clamp(46px,8vw,104px)`, weight 700, `line-height:0.92`, max-width 14ch):
  "DÊ PLAY NA SUA **COLEÇÃO.**" — COLEÇÃO em `#FF3D8B` com `text-shadow:0 0 36px rgba(255,61,
  139,0.6)`.
- Parágrafo (`--muted`, 18px, max-width 540px): "Track, avalie e descubra games num catálogo
  gigante. Estilo Letterboxd — mas pra quem zera fase, não filme."
- CTAs: `CRIAR CONTA GRÁTIS` (gradiente magenta→violeta, glow) + `Explorar catálogo`
  (surface-2, borda branca 12%).

**4. Cover row** (marquee horizontal, padding `30px 0 70px`)
- Máscara de fade nas bordas: `mask-image:linear-gradient(90deg,transparent,#000 8%,#000 92%,
  transparent)`. Faixa de capas 160px (aspect 3/4, radius 10px) em loop
  (`animation: marquee 40s linear`, lista duplicada).

**5. Bento features** (padding `20px 6vw 80px`, max-width 1240px)
- H2 centralizado: "Feito pra quem leva game **a sério**." (a sério em `#34E5FF`).
- Grid `repeat(6,1fr)`, `grid-auto-rows:185px`, gap 16px:
  - **Card grande** `span 4 / span 2`: `linear-gradient(150deg,#1a1019,#0d0a11)`, borda
    magenta 18%, radius 20px, glow radial magenta no canto. Emoji 🎮, H3 24px "Biblioteca com
    status", body: "Jogando, zerado, platinado, dropei, quero jogar. Cada jogo no slot certo —
    e estatísticas automáticas do seu perfil."
  - **Notas 0–10** (`span 2`): ★ + "Reviews com aviso de spoiler."
  - **Wishlist + alertas** (`span 2`): 🔔 + "Avisos quando o lançamento chega."
  - **Listas customizadas** (`span 3`, layout horizontal): 📚 + "'RPGs de 2025', 'pra zerar nas
    férias'…"
  - **Recomendações** (`span 3`, horizontal): ⚡ + "Baseadas na sua biblioteca e gêneros."
  - Cards menores: `--surface-3`, borda branca 8%, radius 20px, padding 24px.

**6. Contadores neon** (padding `20px 6vw 90px`, max-width 1000px)
- Grid `auto-fit,minmax(180px,1fr)`, gap 18px. 3 cards (`#0e0b13`, borda tonal, radius 18px,
  padding `30px 18px`, centralizado). Número 42px weight 700 com `text-shadow:0 0 26px <glow>`:
  - `800k+` magenta — "jogos catalogados"
  - `0` ciano — "reais pra começar"
  - `∞` violeta — "listas que dá pra criar"

**7. CTA final** (centralizado, padding `30px 6vw 110px`, glow radial de fundo)
- H2 "INSIRA A FICHA. **COMECE AGORA.**" (COMECE AGORA em `#34E5FF`). Botão gradiente
  magenta→violeta "JOGAR GRÁTIS ▸".

**8. Footer** — igual à versão A, mas PRESS em `#FF3D8B`.

---

## Interactions & Behavior
- **Seletor de versão**: troca a árvore renderizada com fade-in (`animation: rise .4s ease`,
  opacity 0→1 + translateY 14px→0). Remover em produção.
- **Hovers**: links da nav (cor); cards de feature A (borda + lift -4px, `transition .2s`);
  botão Entrar B (preenche). Defina states equivalentes no codebase.
- **Animações contínuas** (`@keyframes`):
  - `float`: `translateY(0)`→`-12px`→`0`, ease-in-out infinito (cards showcase A).
  - `marquee`: `translateX(0)`→`-50%`, linear infinito (ticker 28s e cover row 40s da B).
    Requer **lista duplicada** no DOM para loop sem emenda.
  - `glow`: opacidade `0.5`↔`1`, 4s ease-in-out (glows da B).
  - `rise`: fade+slide de entrada das seções.
- **Navegação**: todos os CTAs são placeholders. Mapear para signup/login/catálogo reais.
- **Responsivo**: tudo usa `clamp()`, `vw`, e grids `auto-fit/minmax`, então degrada
  razoavelmente. **Ponto de atenção**: o hero da Versão A é grid fixo de 2 colunas — abaixo de
  ~900px troque para 1 coluna (empilhar texto sobre o showcase, ou ocultar o showcase no
  mobile). O bento da B (`repeat(6,1fr)`) deve virar 1–2 colunas no mobile.

## State Management
A landing é essencialmente estática. O único estado é `version: 'A' | 'B'` (ferramenta de
comparação, descartável). Em produção, nenhum estado de cliente é necessário além de
hovers/animações CSS. Se for SSR/estático, melhor ainda.

## Assets
- **Fontes**: Space Grotesk + Space Mono (Google Fonts) — já linkadas no `<head>` do protótipo.
- **Ícones**: atualmente **emojis** (🎮 ★ 🔔 📚 ⚡ ▶ ◆ ▸). Recomendado substituir por um icon set
  do codebase (ex.: Lucide, Phosphor) para consistência e nitidez. Veja a tabela em "Features"
  e "Bento" para o mapeamento semântico de cada um.
- **Capas / screenshots de jogos**: **placeholders procedurais**, gerados por:
  `radial-gradient(125% 120% at 22% 8%, hsl(H 78% 52%), hsl(H+34 62% 30%) 46%, hsl(H+18 55% 11%) 100%)`
  + overlay de scanlines `repeating-linear-gradient(0deg, rgba(0,0,0,0.16) 0 1px, transparent 1px 4px)` em `mix-blend-mode:overlay`.
  Em produção, troque pelo campo `background_image` da RAWG API. Os matizes (`H`) por jogo no
  protótipo: Elden Ring 280, Hades 18, Hollow Knight 200, Celeste 330, Baldur's Gate 3 35,
  Stardew Valley 120, Disco Elysium 160, Cyberpunk 2077 300, Sekiro 10, Balatro 345,
  Pizza Tower 5, Tunic 95, The Witcher 3 48, Returnal 290, Cuphead 40, Outer Wilds 255.
- Sem imagens binárias no bundle.

## Files
- `Pixel Press Landing.dc.html` — protótipo das duas versões (referência de design).
- (Contexto) O app em si — telas de Descoberta e Detalhes — está em `Pixel Press.dc.html` na
  raiz do projeto, caso queira alinhar a identidade visual da landing com o produto.

## Nota legal
Os títulos de jogos citados (Elden Ring, Hades, etc.) são apenas dados de exemplo. Não há
arte protegida no bundle — todas as "capas" são gradientes gerados. Use arte oficial somente
via RAWG API respeitando seus termos.
