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
 */
@Injectable()
export class CacheService {
  private readonly store = new Map<string, Entrada<unknown>>();
  private readonly ttlMs: number;

  constructor(config: ConfigService) {
    const ttlSegundos = config.get<number>('RAWG_CACHE_TTL_SECONDS', 300);
    this.ttlMs = ttlSegundos * 1000;
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
    this.store.set(chave, { valor, expiraEm: Date.now() + this.ttlMs });
  }
}
