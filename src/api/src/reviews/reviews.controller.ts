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
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UsuarioAtual, UsuarioAutenticado } from '../common/decorators/usuario-atual.decorator';
import { Papel } from '../common/enums/papel.enum';
import { ModeracaoService } from '../moderacao/moderacao.service';
import { ReviewsService } from './reviews.service';
import { CriarReviewDto } from './dto/criar-review.dto';
import { EditarReviewDto } from './dto/editar-review.dto';
import { OcultarReviewDto } from './dto/ocultar-review.dto';
import { ListarReviewsDto } from './dto/listar-reviews.dto';

@ApiTags('reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(
    private readonly reviewsService: ReviewsService,
    private readonly moderacaoService: ModeracaoService,
  ) {}

  /** Listagem pública (não exige token); oculta reviews moderadas. */
  @Get()
  async listar(@Query() query: ListarReviewsDto) {
    return this.reviewsService.listarPublicas(query, '/api/v1/reviews', query.jogo);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async criar(@UsuarioAtual() usuario: UsuarioAutenticado, @Body() dto: CriarReviewDto) {
    return this.reviewsService.criar(usuario.id, dto);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async editar(
    @UsuarioAtual() usuario: UsuarioAutenticado,
    @Param('id') id: string,
    @Body() dto: EditarReviewDto,
  ) {
    return this.reviewsService.editar(usuario.id, id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async excluir(@UsuarioAtual() usuario: UsuarioAutenticado, @Param('id') id: string) {
    await this.reviewsService.excluir(usuario.id, id);
  }

  /** Moderação: ocultar review (Moderador+). Resolve denúncias pendentes dela. */
  @Patch(':id/hide')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Papel.MODERADOR)
  async ocultar(
    @UsuarioAtual() usuario: UsuarioAutenticado,
    @Param('id') id: string,
    @Body() dto: OcultarReviewDto,
  ) {
    return this.moderacaoService.ocultarReview(usuario.id, id, dto.motivo);
  }
}
