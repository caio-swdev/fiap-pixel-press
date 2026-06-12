import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JogosService } from './jogos.service';
import { BuscarJogosDto } from './dto/buscar-jogos.dto';

/** Catálogo read-only (RAWG real). Sem guard: público para todos os papéis. */
@ApiTags('jogos')
@Controller('games')
export class JogosController {
  constructor(private readonly jogosService: JogosService) {}

  @Get()
  async buscar(@Query() query: BuscarJogosDto) {
    return this.jogosService.buscar(query, '/api/v1/games');
  }

  @Get(':slug')
  async detalhe(@Param('slug') slug: string) {
    return this.jogosService.detalhe(slug);
  }
}
