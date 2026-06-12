import { IsEnum, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { StatusDenuncia } from '../../common/enums/status-denuncia.enum';

export class ListarDenunciasDto extends PaginationQueryDto {
  /** Filtro de status. No MVP a listagem foca em PENDENTE. */
  @IsOptional()
  @IsEnum(StatusDenuncia)
  status?: StatusDenuncia;
}
