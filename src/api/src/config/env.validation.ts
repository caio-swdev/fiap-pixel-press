import { plainToInstance, Transform } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsString,
  IsUrl,
  MinLength,
  validateSync,
} from 'class-validator';

/** Schema das variáveis de ambiente do MVP. Sem REDIS_URL (cache é in-process). */
export class EnvironmentVariables {
  @IsString()
  @IsNotEmpty()
  DATABASE_URL!: string;

  @IsString()
  @MinLength(16)
  JWT_SECRET!: string;

  @IsString()
  @IsNotEmpty()
  JWT_EXPIRATION!: string;

  @IsString()
  @IsNotEmpty()
  JWT_REFRESH_EXPIRATION!: string;

  @IsString()
  @IsNotEmpty()
  RAWG_API_KEY!: string;

  @IsUrl({ require_tld: false })
  RAWG_BASE_URL!: string;

  @Transform(({ value }) => parseInt(String(value), 10))
  @IsInt()
  RAWG_CACHE_TTL_SECONDS!: number;

  @Transform(({ value }) => String(value).toLowerCase() === 'true')
  @IsBoolean()
  USE_RAWG_MOCK!: boolean;
}

export function validateEnv(config: Record<string, unknown>): EnvironmentVariables {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: false,
  });
  const errors = validateSync(validated, { skipMissingProperties: false });
  if (errors.length > 0) {
    const detalhes = errors
      .map((e) => Object.values(e.constraints ?? {}).join(', '))
      .join('; ');
    throw new Error(`Variáveis de ambiente inválidas: ${detalhes}`);
  }
  return validated;
}
