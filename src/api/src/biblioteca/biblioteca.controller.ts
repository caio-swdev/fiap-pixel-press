import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { UsuarioAtual, UsuarioAutenticado } from '../common/decorators/usuario-atual.decorator';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { BibliotecaService } from './biblioteca.service';
import { AdicionarItemDto } from './dto/adicionar-item.dto';
import { AtualizarItemDto } from './dto/atualizar-item.dto';

@ApiTags('biblioteca')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('biblioteca')
export class BibliotecaController {
  constructor(private readonly bibliotecaService: BibliotecaService) {}

  @Post()
  async adicionar(
    @UsuarioAtual() usuario: UsuarioAutenticado,
    @Body() dto: AdicionarItemDto,
  ) {
    return this.bibliotecaService.adicionar(usuario.id, dto);
  }

  @Get('me')
  async minha(
    @UsuarioAtual() usuario: UsuarioAutenticado,
    @Query() query: PaginationQueryDto,
  ) {
    return this.bibliotecaService.listarDoUsuario(usuario.id, query, '/api/v1/biblioteca/me');
  }

  @Patch(':id')
  async atualizar(
    @UsuarioAtual() usuario: UsuarioAutenticado,
    @Param('id') id: string,
    @Body() dto: AtualizarItemDto,
  ) {
    return this.bibliotecaService.atualizar(usuario.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remover(@UsuarioAtual() usuario: UsuarioAutenticado, @Param('id') id: string) {
    await this.bibliotecaService.remover(usuario.id, id);
  }
}
