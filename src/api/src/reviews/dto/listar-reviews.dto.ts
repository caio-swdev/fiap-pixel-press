import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class ListarReviewsDto extends PaginationQueryDto {
  /** Filtra por slug do jogo. */
  @IsOptional()
  @IsString()
  jogo?: string;
}
