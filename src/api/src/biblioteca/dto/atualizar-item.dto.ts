import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { StatusBiblioteca } from '../../common/enums/status-biblioteca.enum';

export class AtualizarItemDto {
  @IsOptional()
  @IsEnum(StatusBiblioteca)
  status?: StatusBiblioteca;

  @IsOptional()
  @IsInt()
  @Min(0)
  horasJogadas?: number;
}
