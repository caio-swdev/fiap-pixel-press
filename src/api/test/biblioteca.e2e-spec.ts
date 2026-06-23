import request from 'supertest';
import { createTestApp, TestContext } from './utils/app';
import { bearer, loginSeed, SeedTokens } from './utils/auth';
import { expectEnvelope } from './utils/expect';

/**
 * Rotas 11–14 (biblioteca). Ownership, unicidade e validação.
 * Divergência do plano (código vence): status inválido cai no @IsEnum →
 * ValidationPipe → 400 (não 422).
 */
describe('Biblioteca (e2e)', () => {
  let ctx: TestContext;
  let tokens: SeedTokens;

  beforeAll(async () => {
    ctx = await createTestApp();
    tokens = await loginSeed(ctx.app);
  });

  afterAll(async () => {
    await ctx.app.close();
  });

  const http = () => request(ctx.app.getHttpServer());

  it('1. POST /biblioteca → 201 + item criado', async () => {
    const res = await http()
      .post('/api/v1/biblioteca')
      .set(bearer(tokens.usuario))
      .send({ jogoSlug: 'god-of-war', status: 'JOGANDO', horasJogadas: 5 });
    expect(res.status).toBe(201);
    expect(res.body.jogo.slug).toBe('god-of-war');
    expect(res.body.status).toBe('JOGANDO');
  });

  it('2. GET /biblioteca/me → 200 + itens do usuário', async () => {
    const res = await http().get('/api/v1/biblioteca/me').set(bearer(tokens.usuario));
    expect(res.status).toBe(200);
    expect(res.body.count).toBeGreaterThanOrEqual(2);
    expect(Array.isArray(res.body.results)).toBe(true);
  });

  it('3. PATCH /biblioteca/:id (dono) edita status/horas → 200', async () => {
    const res = await http()
      .patch(`/api/v1/biblioteca/${ctx.refs.bibliotecaWitcherId}`)
      .set(bearer(tokens.usuario))
      .send({ status: 'ZERADO', horasJogadas: 200 });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ZERADO');
    expect(res.body.horasJogadas).toBe(200);
  });

  it('4. PATCH /biblioteca/:id de outro usuário → 403', async () => {
    const res = await http()
      .patch(`/api/v1/biblioteca/${ctx.refs.bibliotecaWitcherId}`)
      .set(bearer(tokens.moderador))
      .send({ status: 'DROPEI' });
    expect(res.status).toBe(403);
    expectEnvelope(res.body, 'OWNERSHIP_NEGADO');
  });

  it('5. DELETE /biblioteca/:id de outro usuário → 403', async () => {
    const res = await http()
      .delete(`/api/v1/biblioteca/${ctx.refs.bibliotecaWitcherId}`)
      .set(bearer(tokens.moderador));
    expect(res.status).toBe(403);
  });

  it('6. DELETE /biblioteca/:id (dono) → 204', async () => {
    const res = await http()
      .delete(`/api/v1/biblioteca/${ctx.refs.bibliotecaWitcherId}`)
      .set(bearer(tokens.usuario));
    expect(res.status).toBe(204);
  });

  it('7. adicionar o mesmo jogo 2× → 409 (unicidade)', async () => {
    // A usuária já tem grand-theft-auto-v na biblioteca pelo seed.
    const res = await http()
      .post('/api/v1/biblioteca')
      .set(bearer(tokens.usuario))
      .send({ jogoSlug: 'grand-theft-auto-v', status: 'JOGANDO' });
    expect(res.status).toBe(409);
    expectEnvelope(res.body, 'ITEM_BIBLIOTECA_DUPLICADO');
  });

  it('8. status inválido → 400 (@IsEnum)', async () => {
    const res = await http()
      .post('/api/v1/biblioteca')
      .set(bearer(tokens.usuario))
      .send({ jogoSlug: 'portal-2', status: 'INEXISTENTE' });
    expect(res.status).toBe(400);
    expectEnvelope(res.body);
  });

  it('9. POSTs concorrentes do mesmo jogo → um 201 e um 409, nunca 500 (corrida P2002)', async () => {
    const enviar = () =>
      http()
        .post('/api/v1/biblioteca')
        .set(bearer(tokens.usuario))
        .send({ jogoSlug: 'borderlands-2', status: 'QUERO_JOGAR' });

    const [a, b] = await Promise.all([enviar(), enviar()]);
    const statuses = [a.status, b.status].sort();

    expect(statuses).toEqual([201, 409]);
    const conflito = a.status === 409 ? a : b;
    expectEnvelope(conflito.body, 'ITEM_BIBLIOTECA_DUPLICADO');
  });
});
