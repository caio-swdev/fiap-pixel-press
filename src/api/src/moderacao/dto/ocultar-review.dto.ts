import { IsString, MaxLength, MinLength } from 'class-validator';

export class OcultarReviewDto {
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  motivo!: string;
}
