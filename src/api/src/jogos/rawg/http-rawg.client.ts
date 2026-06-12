import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';
import { RawgIndisponivelException } from '../../common/exceptions/domain.exception';
import {
  JogoDetalhe,
  JogoResumo,
  ParametrosBusca,
  RawgClient,
  ResultadoBusca,
} from './rawg.types';

interface RawgListItem {
  id: number;
  slug: string;
  name: string;
  background_image: string | null;
}

interface RawgListResponse {
  count: number;
  results: RawgListItem[];
}

interface RawgDetailResponse extends RawgListItem {
  description_raw?: string;
  released: string | null;
  metacritic: number | null;
  rating: number | null;
  genres?: { name: string }[];
  platforms?: { platform: { name: string } }[];
}

interface RawgScreenshotsResponse {
  results: { image: string }[];
}

/**
 * Caminho principal do catálogo: consome a RAWG API real via @nestjs/axios.
 * A chave (RAWG_API_KEY) entra só como query param e jamais é logada ou devolvida.
 * Qualquer falha (timeout/4xx/5xx) vira RawgIndisponivelException → 502.
 */
@Injectable()
export class HttpRawgClient implements RawgClient {
  private readonly logger = new Logger(HttpRawgClient.name);
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(private readonly http: HttpService, config: ConfigService) {
    this.baseUrl = config.getOrThrow<string>('RAWG_BASE_URL');
    this.apiKey = config.getOrThrow<string>('RAWG_API_KEY');
  }

  async buscar(params: ParametrosBusca): Promise<ResultadoBusca> {
    const data = await this.get<RawgListResponse>('/games', {
      search: params.search ?? '',
      page: params.page,
      page_size: params.page_size,
    });
    return {
      count: data.count ?? 0,
      results: (data.results ?? []).map((item) => this.normalizarResumo(item)),
    };
  }

  async detalhe(slug: string): Promise<JogoDetalhe> {
    const data = await this.get<RawgDetailResponse>(`/games/${encodeURIComponent(slug)}`, {});
    let screenshots: string[] = [];
    try {
      const shots = await this.get<RawgScreenshotsResponse>(
        `/games/${encodeURIComponent(slug)}/screenshots`,
        {},
      );
      screenshots = (shots.results ?? []).map((s) => s.image).filter(Boolean);
    } catch {
      screenshots = [];
    }
    return {
      ...this.normalizarResumo(data),
      descricao: data.description_raw ?? null,
      lancamento: data.released ?? null,
      metacritic: data.metacritic ?? null,
      rating: data.rating ?? null,
      generos: (data.genres ?? []).map((g) => g.name),
      plataformas: (data.platforms ?? []).map((p) => p.platform.name),
      screenshots,
    };
  }

  private normalizarResumo(item: RawgListItem): JogoResumo {
    return {
      rawgId: item.id,
      slug: item.slug,
      nome: item.name,
      capaUrl: item.background_image ?? null,
    };
  }

  private async get<T>(path: string, query: Record<string, string | number>): Promise<T> {
    try {
      const response = await firstValueFrom(
        this.http.get<T>(`${this.baseUrl}${path}`, {
          params: { key: this.apiKey, ...query },
          timeout: 8000,
        }),
      );
      return response.data;
    } catch (erro) {
      // Loga só o status, nunca a URL completa (que carrega a chave).
      const status = erro instanceof AxiosError ? erro.response?.status ?? 'timeout' : 'desconhecido';
      this.logger.warn(`Falha ao consultar a RAWG em ${path} (status: ${status}).`);
      throw new RawgIndisponivelException();
    }
  }
}
