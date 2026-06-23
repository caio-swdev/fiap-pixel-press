import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface Entrada<T> {
  valor: T;
  expiraEm: number;
}

/**
 * Cache-aside in-process (desvio consciente do .ai/: substitui o Redis no MVP).
 * Map chave → { valor, expiraEm } com TTL de RAWG_CACHE_TTL_SECONDS.
 * EXCLUSIVO para respostas da RAWG; dados de usuário nunca passam por aqui.
 *
 * Teto de tamanho (RAWG_CACHE_MAX_ENTRIES): como /games é público e o termo de
 * busca é string livre, o espaço de chaves é ilimitado. Sem teto, o Map cresceria
 * sem limite (vetor de OOM/DoS). Ao atingir o teto, descarta a entrada mais antiga
 * (FIFO por ordem de inserção do Map).
 */
@Injectable()
export class CacheService {
  private readonly store = new Map<string, Entrada<unknown>>();
  private readonly ttlMs: number;
  private readonly maxEntradas: number;

  constructor(config: ConfigService) {
    const ttlSegundos = config.get<number>('RAWG_CACHE_TTL_SECONDS', 300);
    this.ttlMs = ttlSegundos * 1000;
    this.maxEntradas = config.get<number>('RAWG_CACHE_MAX_ENTRIES', 1000);
  }

  async get<T>(chave: string): Promise<T | null> {
    const entrada = this.store.get(chave);
    if (!entrada) {
      return null;
    }
    if (Date.now() >= entrada.expiraEm) {
      this.store.delete(chave);
      return null;
    }
    return entrada.valor as T;
  }

  async set<T>(chave: string, valor: T): Promise<void> {
    // Só evicta ao inserir chave nova: atualizar uma existente não cresce o Map.
    if (!this.store.has(chave) && this.store.size >= this.maxEntradas) {
      const maisAntiga = this.store.keys().next().value;
      if (maisAntiga !== undefined) {
        this.store.delete(maisAntiga);
      }
    }
    this.store.set(chave, { valor, expiraEm: Date.now() + this.ttlMs });
  }
}
