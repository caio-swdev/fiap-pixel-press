import { Module } from '@nestjs/common';
import { JogosModule } from '../jogos/jogos.module';
import { ModeracaoModule } from '../moderacao/moderacao.module';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';

@Module({
  imports: [JogosModule, ModeracaoModule],
  controllers: [ReviewsController],
  providers: [ReviewsService],
})
export class ReviewsModule {}
