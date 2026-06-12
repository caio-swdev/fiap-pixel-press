import { IsBoolean, IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

export class EditarReviewDto {
  @IsOptional()
  @IsInt()
  nota?: number;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  texto?: string;

  @IsOptional()
  @IsBoolean()
  spoiler?: boolean;
}
