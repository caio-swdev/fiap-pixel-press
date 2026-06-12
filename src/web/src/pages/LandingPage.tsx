import { Link, Navigate } from 'react-router-dom';
import { useSession } from '../auth/session';

const V = '#A855F7';   // violet
const CY = '#34E5FF';  // cyan
const BG = '#08070C';
const SURF = '#100E17';
const SURF2 = '#16131F';
const FG = '#F2F0F7';
const MUTED = '#9890AB';
const FAINT = '#615A75';

const GAMES = [
  { title: 'Elden Ring',      slug: 'elden-ring',      h: 280, cover: '/covers/elden-ring.jpg' },
  { title: 'Hades',           slug: 'hades',           h: 18,  cover: '/covers/hades.jpg' },
  { title: 'Hollow Knight',   slug: 'hollow-knight',   h: 200, cover: '/covers/hollow-knight.jpg' },
  { title: 'Celeste',         slug: 'celeste',         h: 330, cover: '/covers/celeste.jpg' },
  { title: "Baldur's Gate 3", slug: 'baldurs-gate-3',  h: 35,  cover: '/covers/baldurs-gate-3.jpg' },
  { title: 'Stardew Valley',  slug: 'stardew-valley',  h: 120, cover: '/covers/stardew-valley.jpg' },
];
const FLOAT_DUR = [3.4, 4.2, 3.8, 5.0, 4.6, 3.6];
const FLOAT_DEL = [0, 0.5, 1.0, 0.25, 0.75, 1.25];


const STEPS = [
  { n: 1, title: 'Busque no catálogo', body: 'Mais de 800 mil títulos indexados via RAWG API.' },
  { n: 2, title: 'Adicione à biblioteca', body: 'Escolha o status e opcionalmente uma nota.' },
  { n: 3, title: 'Avalie e compartilhe', body: 'Escreva reviews, monte listas e exporte estatísticas.' },
];

// Mapa de papéis — RBAC hierárquico (USUARIO ⊆ MODERADOR ⊆ ADMIN).
const ROLES = {
  publico:   { label: 'Público',   color: FAINT },
  usuario:   { label: 'Usuário',   color: '#34E5FF' },
  moderador: { label: 'Moderador', color: '#A855F7' },
  admin:     { label: 'Admin',     color: '#FF3D8B' },
} as const;

// Referência de tudo que o MVP entrega, agrupado por domínio (espelha a API /api/v1).
const FEATURE_MAP: { emoji: string; domain: string; role: keyof typeof ROLES; items: string[] }[] = [
  {
    emoji: '🔑', domain: 'Autenticação & RBAC', role: 'publico',
    items: [
      'Cadastro e login com JWT (access + refresh token)',
      'Renovação de sessão automática no expirar do token',
      'Papéis hierárquicos: Usuário ⊆ Moderador ⊆ Admin',
    ],
  },
  {
    emoji: '🎮', domain: 'Catálogo', role: 'usuario',
    items: [
      'Busca em +800 mil jogos via RAWG API, com paginação',
      'Página de detalhe: descrição, lançamento, gêneros, plataformas',
      'Metacritic, rating e galeria de screenshots',
    ],
  },
  {
    emoji: '📚', domain: 'Biblioteca pessoal', role: 'usuario',
    items: [
      '5 status de tracking: jogando, zerado, quero jogar, dropei, platinado',
      'Registro de horas jogadas por título',
      'Adicionar, atualizar status e remover itens',
    ],
  },
  {
    emoji: '★', domain: 'Reviews & avaliações', role: 'usuario',
    items: [
      'Nota de 0 a 10 + texto livre (até 5.000 caracteres)',
      'Marcação de spoiler com aviso na exibição',
      'Editar e excluir as próprias reviews',
    ],
  },
  {
    emoji: '🛡️', domain: 'Moderação', role: 'moderador',
    items: [
      'Denúncia de reviews pela comunidade',
      'Fila de denúncias pendentes para revisão',
      'Ocultar reviews que violem as regras',
    ],
  },
  {
    emoji: '⚙️', domain: 'Administração', role: 'admin',
    items: [
      'Listagem e consulta de todos os usuários',
      'Atribuição de papéis (promover/rebaixar)',
      'Controle de acesso aplicado no backend (não só na UI)',
    ],
  },
];

export function LandingPage() {
  const { autenticado } = useSession();

  if (autenticado) return <Navigate to="/catalogo" replace />;

  return (
    <>
      <style>{`
        .lp { font-family: 'Space Grotesk', 'Sora', sans-serif; background: ${BG}; color: ${FG}; min-height: 100vh; overflow-x: hidden; }
        @keyframes lp-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
        .lp-float { animation: lp-float var(--fd,4s) ease-in-out infinite; animation-delay: var(--fdl,0s); }
        .lp-map-card { transition: border-color .2s, transform .2s; }
        .lp-map-card:hover { border-color: rgba(168,85,247,.30); transform: translateY(-3px); }
        .lp-nav-link { color: ${MUTED}; font-size: 14px; text-decoration: none; transition: color .15s; }
        .lp-nav-link:hover { color: ${FG}; }
        @media (max-width: 900px) {
          .lp-hero { grid-template-columns: 1fr !important; }
          .lp-showcase { display: none !important; }
          .lp-nav-links { display: none !important; }
        }
      `}</style>

      <div className="lp">
        {/* ── Navbar ─────────────────────────────────────────────────────── */}
        <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(8,7,12,0.8)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '18px 6vw', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 32, height: 32, borderRadius: 8, background: V, color: '#0b0911', display: 'grid', placeItems: 'center', boxShadow: '0 0 20px -6px rgba(168,85,247,0.6)', flexShrink: 0 }}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="4" height="4" rx="1" />
              </svg>
            </span>
            <span style={{ fontFamily: "'Chakra Petch', sans-serif", fontWeight: 700, fontSize: 18, letterSpacing: '-0.02em', color: FG }}>
              Pixel<span style={{ color: V }}>Press</span>
            </span>
          </div>
          <div className="lp-nav-links" style={{ display: 'flex', alignItems: 'center', gap: 30 }}>
            <a href="#recursos" className="lp-nav-link">Descobrir</a>
            <a href="#como-funciona" className="lp-nav-link">Listas</a>
            <a href="#recursos" className="lp-nav-link">Comunidade</a>
            <Link to="/login" style={{ color: FG, fontWeight: 500, fontSize: 14, textDecoration: 'none' }}>Entrar</Link>
            <Link to="/login" style={{ background: V, color: '#0b0911', fontWeight: 600, fontSize: 14, padding: '9px 18px', borderRadius: 10, textDecoration: 'none' }}>Criar conta</Link>
          </div>
        </nav>

        {/* ── Hero ───────────────────────────────────────────────────────── */}
        <section className="lp-hero" style={{ padding: '70px 6vw 80px', display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: 40, alignItems: 'center', maxWidth: 1320, margin: '0 auto' }}>
          {/* Left */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.28)', borderRadius: 30, padding: '6px 14px', width: 'fit-content' }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: V, boxShadow: '0 0 8px rgba(168,85,247,0.8)' }} />
              <span style={{ color: '#C77DFF', fontSize: 12.5, fontFamily: "'Space Mono', monospace", letterSpacing: '0.1em' }}>O diário dos seus games</span>
            </div>

            <h1 style={{ fontSize: 'clamp(40px,5vw,64px)', fontWeight: 700, lineHeight: 0.96, letterSpacing: '-0.035em', margin: 0 }}>
              Todo jogo que você jogou,{' '}
              <span style={{ background: `linear-gradient(110deg,${V},${CY})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                num só lugar.
              </span>
            </h1>

            <p style={{ color: MUTED, fontSize: 17.5, lineHeight: 1.6, maxWidth: 480, margin: 0 }}>
              Catalogue, avalie e descubra games num catálogo de +800 mil títulos. Marque o que está jogando, dê notas, monte listas e acompanhe lançamentos.
            </p>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link to="/login" style={{ background: V, color: '#0b0911', fontWeight: 700, fontSize: 15, padding: '14px 26px', borderRadius: 12, textDecoration: 'none', boxShadow: '0 14px 34px -12px rgba(168,85,247,0.7)' }}>
                Começar grátis
              </Link>
              <Link to="/login" style={{ background: SURF2, color: FG, fontWeight: 500, fontSize: 15, padding: '14px 22px', borderRadius: 12, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.10)' }}>
                ▶ Ver demo
              </Link>
            </div>

            <div style={{ display: 'flex', gap: 34, paddingTop: 8 }}>
              {[{ val: '800k+', label: 'jogos no catálogo' }, { val: '5', label: 'status de tracking' }, { val: 'RAWG', label: 'base de dados' }].map(s => (
                <div key={s.label}>
                  <div style={{ fontSize: 25, fontWeight: 700 }}>{s.val}</div>
                  <div style={{ fontSize: 12.5, color: FAINT, fontFamily: "'Space Mono',monospace", letterSpacing: '0.1em', textTransform: 'uppercase' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — 3D Showcase */}
          <div className="lp-showcase" style={{ height: 480, perspective: '1400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, transform: 'rotateY(-18deg) rotateX(6deg) rotateZ(2deg)', transformStyle: 'preserve-3d', width: '100%' }}>
              {GAMES.map((g, i) => {
                return (
                  <div key={g.title} className="lp-float" style={{ aspectRatio: '3/4', borderRadius: 13, overflow: 'hidden', position: 'relative', background: `url(${g.cover}) center/cover`, boxShadow: '0 24px 50px -18px rgba(0,0,0,0.8)', ['--fd' as string]: `${FLOAT_DUR[i]}s`, ['--fdl' as string]: `${FLOAT_DEL[i]}s` }}>
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '8px 10px', background: 'linear-gradient(to top,rgba(0,0,0,0.8),transparent)' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>{g.title}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Platform band ──────────────────────────────────────────────── */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '24px 6vw', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 30, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: FAINT }}>CATÁLOGO DE TODAS AS PLATAFORMAS</span>
          {['PC', 'PS5', 'XBOX', 'SWITCH', 'MOBILE'].map(p => (
            <span key={p} style={{ fontFamily: "'Space Mono',monospace", fontSize: 13, fontWeight: 700, color: MUTED, letterSpacing: '0.05em' }}>{p}</span>
          ))}
        </div>

        {/* ── Recursos (mapa completo de features por área e acesso) ─────── */}
        <section id="recursos" style={{ padding: '90px 6vw 70px', maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 14 }}>
            <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: V, marginBottom: 12 }}>RECURSOS</div>
            <h2 style={{ fontSize: 'clamp(30px,3.5vw,42px)', fontWeight: 700, letterSpacing: '-0.03em', margin: 0 }}>
              Tudo que você pode fazer
            </h2>
            <p style={{ color: MUTED, fontSize: 15.5, margin: '14px auto 0', maxWidth: 560, lineHeight: 1.6 }}>
              Todos os recursos da plataforma, organizados por área e nível de acesso.
            </p>
          </div>

          {/* Legenda de papéis */}
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 16, margin: '24px 0 32px' }}>
            {Object.values(ROLES).map(r => (
              <span key={r.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontFamily: "'Space Mono',monospace", fontSize: 11.5, letterSpacing: '0.05em', color: MUTED }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: r.color, boxShadow: `0 0 8px ${r.color}99` }} />
                {r.label}
              </span>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 16 }}>
            {FEATURE_MAP.map(group => {
              const role = ROLES[group.role] ?? ROLES.publico;
              return (
                <div key={group.domain} className="lp-map-card" style={{ background: SURF, border: '1px solid rgba(255,255,255,0.07)', borderRadius: 18, padding: '24px 24px 22px', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ width: 40, height: 40, borderRadius: 11, background: `${role.color}22`, display: 'grid', placeItems: 'center', fontSize: 19 }}>{group.emoji}</span>
                      <h3 style={{ fontSize: 17, fontWeight: 700, margin: 0, letterSpacing: '-0.01em' }}>{group.domain}</h3>
                    </div>
                    <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: role.color, border: `1px solid ${role.color}55`, borderRadius: 20, padding: '4px 10px', whiteSpace: 'nowrap' }}>{role.label}</span>
                  </div>
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {group.items.map(item => (
                      <li key={item} style={{ display: 'flex', gap: 10, fontSize: 14, color: MUTED, lineHeight: 1.5 }}>
                        <span style={{ color: role.color, flexShrink: 0, marginTop: 1 }}>▸</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── How it works ───────────────────────────────────────────────── */}
        <section id="como-funciona" style={{ padding: '30px 6vw 90px', maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ background: 'linear-gradient(160deg,#15121F,#0c0a12)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 24, padding: '52px 48px' }}>
            <h2 style={{ fontSize: 'clamp(28px,3vw,38px)', fontWeight: 700, letterSpacing: '-0.03em', textAlign: 'center', margin: '0 0 40px' }}>
              Comece em 3 passos
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 34 }}>
              {STEPS.map(s => (
                <div key={s.n}>
                  <div style={{ width: 34, height: 34, borderRadius: 9, background: V, color: '#0b0911', fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                    {s.n}
                  </div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, margin: '0 0 8px' }}>{s.title}</h3>
                  <p style={{ fontSize: 14, color: MUTED, margin: 0, lineHeight: 1.6 }}>{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA final ──────────────────────────────────────────────────── */}
        <section style={{ textAlign: 'center', maxWidth: 760, margin: '0 auto', padding: '40px 6vw 100px' }}>
          <h2 style={{ fontSize: 'clamp(32px,4.5vw,52px)', fontWeight: 700, letterSpacing: '-0.035em', margin: '0 0 16px' }}>
            Pronto para catalogar sua coleção?
          </h2>
          <p style={{ color: MUTED, fontSize: 17, marginBottom: 32 }}>Grátis para sempre. Sem cartão de crédito.</p>
          <Link to="/login" style={{ background: V, color: '#0b0911', fontWeight: 700, fontSize: 16, padding: '16px 34px', borderRadius: 12, textDecoration: 'none', display: 'inline-block', boxShadow: '0 14px 34px -12px rgba(168,85,247,0.7)' }}>
            Criar minha conta
          </Link>
        </section>

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '34px 6vw', display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: 1320, margin: '0 auto', flexWrap: 'wrap', gap: 12 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 24, height: 24, borderRadius: 6, background: V, color: '#0b0911', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="4" height="4" rx="1" />
              </svg>
            </span>
            <span style={{ fontFamily: "'Chakra Petch', sans-serif", fontWeight: 700, fontSize: 15, color: FG }}>
              Pixel<span style={{ color: V }}>Press</span>
            </span>
          </span>
          <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: FAINT, letterSpacing: '0.08em' }}>
            Dados de jogos via RAWG API · © 2026
          </span>
        </footer>
      </div>
    </>
  );
}
