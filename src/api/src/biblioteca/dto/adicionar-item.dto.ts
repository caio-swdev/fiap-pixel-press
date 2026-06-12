import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { StatusBiblioteca } from '../../common/enums/status-biblioteca.enum';

export class AdicionarItemDto {
  @IsString()
  jogoSlug!: string;

  @IsEnum(StatusBiblioteca)
  status!: StatusBiblioteca;

  @IsOptional()
  @IsInt()
  @Min(0)
  horasJogadas?: number;
}
