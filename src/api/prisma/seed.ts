import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import fixture from '../src/jogos/rawg/jogos.fixture.json';

/**
 * Massa de demo recriada a cada boot (banco SQLite efêmero).
 * Idempotente: limpa as tabelas antes de popular.
 *
 * Credenciais (todas com a mesma senha de demo): Senha@123
 *   admin@pixelpress.dev      → ADMIN
 *   moderador@pixelpress.dev  → MODERADOR
 *   usuario@pixelpress.dev    → USUARIO
 *   inativo@pixelpress.dev    → USUARIO (ativo=false)
 */

const prisma = new PrismaClient();
const SENHA_DEMO = 'Senha@123';

interface JogoFixture {
  rawgId: number;
  slug: string;
  nome: string;
  capaUrl: string | null;
}

async function main(): Promise<void> {
  // Limpeza (ordem respeitando FKs).
  await prisma.denuncia.deleteMany();
  await prisma.review.deleteMany();
  await prisma.itemBiblioteca.deleteMany();
  await prisma.jogo.deleteMany();
  await prisma.usuario.deleteMany();

  const senhaHash = await bcrypt.hash(SENHA_DEMO, 10);

  const [admin, moderador, usuario] = await Promise.all([
    prisma.usuario.create({
      data: { email: 'admin@pixelpress.dev', nome: 'Alice Admin', senhaHash, papel: 'ADMIN' },
    }),
    prisma.usuario.create({
      data: {
        email: 'moderador@pixelpress.dev',
        nome: 'Marcos Moderador',
        senhaHash,
        papel: 'MODERADOR',
      },
    }),
    prisma.usuario.create({
      data: { email: 'usuario@pixelpress.dev', nome: 'Ursula Usuária', senhaHash, papel: 'USUARIO' },
    }),
    prisma.usuario.create({
      data: {
        email: 'inativo@pixelpress.dev',
        nome: 'Ivo Inativo',
        senhaHash,
        papel: 'USUARIO',
        ativo: false,
      },
    }),
  ]);

  // Referências mínimas de Jogo (subconjunto da fixture RAWG).
  const jogos = fixture as JogoFixture[];
  const porSlug = (slug: string): JogoFixture => {
    const j = jogos.find((g) => g.slug === slug);
    if (!j) {
      throw new Error(`Fixture sem o jogo ${slug}`);
    }
    return j;
  };

  const seedJogos = [
    'the-witcher-3-wild-hunt',
    'grand-theft-auto-v',
    'portal-2',
    'god-of-war',
  ].map(porSlug);

  const jogosCriados = await Promise.all(
    seedJogos.map((j) =>
      prisma.jogo.create({
        data: { rawgId: j.rawgId, slug: j.slug, nome: j.nome, capaUrl: j.capaUrl },
      }),
    ),
  );
  const jogoPorSlug = new Map(jogosCriados.map((j) => [j.slug, j]));
  const witcher = jogoPorSlug.get('the-witcher-3-wild-hunt')!;
  const gta = jogoPorSlug.get('grand-theft-auto-v')!;
  const portal = jogoPorSlug.get('portal-2')!;

  // Biblioteca da usuária comum.
  await prisma.itemBiblioteca.createMany({
    data: [
      { usuarioId: usuario.id, jogoId: witcher.id, status: 'PLATINADO', horasJogadas: 120 },
      { usuarioId: usuario.id, jogoId: gta.id, status: 'JOGANDO', horasJogadas: 45 },
    ],
  });

  // Reviews.
  const reviewUsuario = await prisma.review.create({
    data: {
      usuarioId: usuario.id,
      jogoId: witcher.id,
      nota: 10,
      texto: 'Melhor RPG que já joguei. História impecável.',
      spoiler: false,
    },
  });
  await prisma.review.create({
    data: {
      usuarioId: moderador.id,
      jogoId: portal.id,
      nota: 9,
      texto: 'Puzzles geniais e humor afiado.',
      spoiler: false,
    },
  });

  // 1 denúncia pendente (admin denuncia a review da usuária) para demonstrar moderação.
  await prisma.denuncia.create({
    data: {
      reviewId: reviewUsuario.id,
      denuncianteId: admin.id,
      motivo: 'Conteúdo possivelmente fora das diretrizes da comunidade.',
      status: 'PENDENTE',
    },
  });

  // eslint-disable-next-line no-console
  console.log('Seed concluído: 4 usuários, 4 jogos, 2 itens de biblioteca, 2 reviews, 1 denúncia pendente.');
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error('Falha no seed:', e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
