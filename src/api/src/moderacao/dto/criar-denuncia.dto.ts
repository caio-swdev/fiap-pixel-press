import { IsString, MaxLength, MinLength } from 'class-validator';

export class CriarDenunciaDto {
  @IsString()
  reviewId!: string;

  @IsString()
  @MinLength(3)
  @MaxLength(500)
  motivo!: string;
}
