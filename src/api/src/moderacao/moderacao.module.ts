import { Module } from '@nestjs/common';
import { ModeracaoController } from './moderacao.controller';
import { ModeracaoService } from './moderacao.service';

@Module({
  controllers: [ModeracaoController],
  providers: [ModeracaoService],
  exports: [ModeracaoService],
})
export class ModeracaoModule {}
