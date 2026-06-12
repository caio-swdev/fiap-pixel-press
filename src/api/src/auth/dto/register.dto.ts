import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(80)
  nome!: string;

  @IsString()
  @MinLength(6)
  @MaxLength(72)
  senha!: string;
}
