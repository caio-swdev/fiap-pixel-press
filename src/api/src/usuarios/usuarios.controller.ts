import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UsuarioAtual, UsuarioAutenticado } from '../common/decorators/usuario-atual.decorator';
import { Papel } from '../common/enums/papel.enum';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { UsuariosService } from './usuarios.service';
import { AtualizarPerfilDto } from './dto/atualizar-perfil.dto';
import { AtribuirPapelDto } from './dto/atribuir-papel.dto';

@ApiTags('usuarios')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get('me')
  async meusDados(@UsuarioAtual() usuario: UsuarioAutenticado) {
    return this.usuariosService.buscarPorId(usuario.id);
  }

  @Patch('me')
  async atualizarMeuPerfil(
    @UsuarioAtual() usuario: UsuarioAutenticado,
    @Body() dto: AtualizarPerfilDto,
  ) {
    return this.usuariosService.atualizarPerfil(usuario.id, dto);
  }

  @Get()
  @Roles(Papel.ADMIN)
  async listar(@Query() query: PaginationQueryDto) {
    return this.usuariosService.listar(query, '/api/v1/usuarios');
  }

  @Get(':id')
  async porId(@Param('id') id: string) {
    return this.usuariosService.buscarPorId(id);
  }

  @Patch(':id/papel')
  @Roles(Papel.ADMIN)
  async atribuirPapel(@Param('id') id: string, @Body() dto: AtribuirPapelDto) {
    return this.usuariosService.atribuirPapel(id, dto.papel);
  }
}
