import { IsBoolean, IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

export class CriarReviewDto {
  @IsString()
  jogoSlug!: string;

  // Faixa 0..10 é regra de negócio: validada no service (422), não aqui (evita 400).
  @IsInt()
  nota!: number;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  texto?: string;

  @IsBoolean()
  spoiler!: boolean;
}
