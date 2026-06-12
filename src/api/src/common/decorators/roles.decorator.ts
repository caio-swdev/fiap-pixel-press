import { SetMetadata } from '@nestjs/common';
import { Papel } from '../enums/papel.enum';

export const ROLES_KEY = 'roles';

/** Exige o papel mínimo informado (hierárquico) para acessar a rota. */
export const Roles = (...papeis: Papel[]) => SetMetadata(ROLES_KEY, papeis);
