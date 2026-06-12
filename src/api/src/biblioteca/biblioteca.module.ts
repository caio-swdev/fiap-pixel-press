import { Module } from '@nestjs/common';
import { JogosModule } from '../jogos/jogos.module';
import { BibliotecaController } from './biblioteca.controller';
import { BibliotecaService } from './biblioteca.service';

@Module({
  imports: [JogosModule],
  controllers: [BibliotecaController],
  providers: [BibliotecaService],
})
export class BibliotecaModule {}
