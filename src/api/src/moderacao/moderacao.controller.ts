import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UsuarioAtual, UsuarioAutenticado } from '../common/decorators/usuario-atual.decorator';
import { Papel } from '../common/enums/papel.enum';
import { apiPath } from '../common/http/api-path';
import { ModeracaoService } from './moderacao.service';
import { CriarDenunciaDto } from './dto/criar-denuncia.dto';
import { ListarDenunciasDto } from './dto/listar-denuncias.dto';
import { OcultarReviewDto } from './dto/ocultar-review.dto';

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
    return this.moderacaoService.listarPendentes(query, apiPath('moderation/reports'));
  }

  /**
   * Moderação: ocultar review (Moderador+). Resolve denúncias pendentes dela.
   * Mantém a URL /reviews/:id/hide, mas a ação pertence à moderação (não às reviews).
   */
  @Patch('reviews/:id/hide')
  @Roles(Papel.MODERADOR)
  async ocultarReview(
    @UsuarioAtual() usuario: UsuarioAutenticado,
    @Param('id') id: string,
    @Body() dto: OcultarReviewDto,
  ) {
    return this.moderacaoService.ocultarReview(usuario.id, id, dto.motivo);
  }
}
