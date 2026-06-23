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
import { apiPath } from '../common/http/api-path';
import { ReviewsService } from './reviews.service';
import { CriarReviewDto } from './dto/criar-review.dto';
import { EditarReviewDto } from './dto/editar-review.dto';
import { ListarReviewsDto } from './dto/listar-reviews.dto';

@ApiTags('reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  /** Listagem pública (não exige token); oculta reviews moderadas. */
  @Get()
  async listar(@Query() query: ListarReviewsDto) {
    return this.reviewsService.listarPublicas(query, apiPath('reviews'), query.jogo);
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
}
