import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UsuarioAtual, UsuarioAutenticado } from '../common/decorators/usuario-atual.decorator';
import { Papel } from '../common/enums/papel.enum';
import { ModeracaoService } from './moderacao.service';
import { CriarDenunciaDto } from './dto/criar-denuncia.dto';
import { ListarDenunciasDto } from './dto/listar-denuncias.dto';

@ApiTags('moderacao')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class ModeracaoController {
  constructor(private readonly moderacaoService: ModeracaoService) {}

  /** Qualquer usuário registrado pode denunciar. */
  @Post('reports')
  async denunciar(
    @UsuarioAtual() usuario: UsuarioAutenticado,
    @Body() dto: CriarDenunciaDto,
  ) {
    return this.moderacaoService.criarDenuncia(usuario.id, dto);
  }

  /** Moderador (ou Admin) lista denúncias pendentes. */
  @Get('moderation/reports')
  @Roles(Papel.MODERADOR)
  async pendentes(@Query() query: ListarDenunciasDto) {
    return this.moderacaoService.listarPendentes(query, '/api/v1/moderation/reports');
  }
}
