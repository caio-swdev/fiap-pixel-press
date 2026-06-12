import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { AppConfigModule } from './config/config.module';
import { PrismaModule } from './common/prisma/prisma.module';
import { CacheModule } from './common/cache/cache.module';
import { AuthModule } from './auth/auth.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { JogosModule } from './jogos/jogos.module';
import { BibliotecaModule } from './biblioteca/biblioteca.module';
import { ReviewsModule } from './reviews/reviews.module';
import { ModeracaoModule } from './moderacao/moderacao.module';
import { ListasModule } from './listas/listas.module';
import { SocialModule } from './social/social.module';
import { WishlistModule } from './wishlist/wishlist.module';

@Module({
  imports: [
    AppConfigModule,
    LoggerModule.forRoot({
      pinoHttp: {
        transport:
          process.env.NODE_ENV === 'production'
            ? undefined
            : { target: 'pino-pretty', options: { singleLine: true } },
        // Nunca logar headers de autenticação nem a chave RAWG.
        redact: ['req.headers.authorization', 'req.query.key'],
      },
    }),
    PrismaModule,
    CacheModule,
    AuthModule,
    UsuariosModule,
    JogosModule,
    BibliotecaModule,
    ReviewsModule,
    ModeracaoModule,
    // Fora do MVP, declarados para preservar a estrutura:
    ListasModule,
    SocialModule,
    WishlistModule,
  ],
})
export class AppModule {}
