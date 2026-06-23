import { ConfigService } from '@nestjs/config';
import { CacheService } from '../src/common/cache/cache.service';

/**
 * Unidade do CacheService (sem app). Foca o teto de tamanho (#8 do relatório de
 * dívida técnica): garante que o Map não cresce sem limite e que a entrada mais
 * antiga é descartada ao estourar o teto.
 */
function fakeConfig(overrides: Record<string, number>): ConfigService {
  return {
    get<T>(chave: string, padrao: T): T {
      return (chave in overrides ? overrides[chave] : padrao) as T;
    },
  } as unknown as ConfigService;
}

describe('CacheService (teto de tamanho)', () => {
  it('1. descarta a entrada mais antiga ao atingir RAWG_CACHE_MAX_ENTRIES', async () => {
    const cache = new CacheService(fakeConfig({ RAWG_CACHE_MAX_ENTRIES: 3, RAWG_CACHE_TTL_SECONDS: 300 }));

    await cache.set('a', 1);
    await cache.set('b', 2);
    await cache.set('c', 3);
    // Estoura o teto: 'a' (mais antiga) deve sair.
    await cache.set('d', 4);

    expect(await cache.get('a')).toBeNull();
    expect(await cache.get('b')).toBe(2);
    expect(await cache.get('c')).toBe(3);
    expect(await cache.get('d')).toBe(4);
  });

  it('2. atualizar chave existente não evicta nem cresce o Map', async () => {
    const cache = new CacheService(fakeConfig({ RAWG_CACHE_MAX_ENTRIES: 2, RAWG_CACHE_TTL_SECONDS: 300 }));

    await cache.set('a', 1);
    await cache.set('b', 2);
    // Reescreve 'a': continua com 2 entradas, 'b' permanece.
    await cache.set('a', 99);

    expect(await cache.get('a')).toBe(99);
    expect(await cache.get('b')).toBe(2);
  });

  it('3. entrada expirada é removida na leitura (TTL)', async () => {
    const cache = new CacheService(fakeConfig({ RAWG_CACHE_MAX_ENTRIES: 10, RAWG_CACHE_TTL_SECONDS: 0 }));
    await cache.set('a', 1);
    expect(await cache.get('a')).toBeNull();
  });
});
