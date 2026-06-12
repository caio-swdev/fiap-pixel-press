import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JogosController } from './jogos.controller';
import { JogosService } from './jogos.service';
import { HttpRawgClient } from './rawg/http-rawg.client';
import { MockRawgClient } from './rawg/mock-rawg.client';
import { RAWG_CLIENT } from './rawg/rawg.types';

/**
 * Factory escolhe a implementação do RawgClient por USE_RAWG_MOCK:
 *   false (default) → HttpRawgClient (RAWG real)
 *   true            → MockRawgClient (fixture offline)
 */
@Module({
  imports: [HttpModule],
  controllers: [JogosController],
  providers: [
    JogosService,
    HttpRawgClient,
    MockRawgClient,
    {
      provide: RAWG_CLIENT,
      inject: [ConfigService, HttpRawgClient, MockRawgClient],
      useFactory: (
        config: ConfigService,
        httpClient: HttpRawgClient,
        mockClient: MockRawgClient,
      ) => (config.get<boolean>('USE_RAWG_MOCK') ? mockClient : httpClient),
    },
  ],
  exports: [JogosService],
})
export class JogosModule {}
