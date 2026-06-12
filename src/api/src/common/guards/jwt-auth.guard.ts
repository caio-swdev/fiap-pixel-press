import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/** Exige JWT válido. Ausência/invalidez → 401 (via Passport). */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
