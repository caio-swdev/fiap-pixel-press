import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class AtualizarPerfilDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  nome?: string;
}
