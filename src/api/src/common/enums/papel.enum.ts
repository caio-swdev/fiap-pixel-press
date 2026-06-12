/**
 * Papéis do RBAC. Fonte de verdade do domínio (SQLite não suporta enum nativo).
 * Hierarquia: ADMIN ⊇ MODERADOR ⊇ USUARIO.
 */
export enum Papel {
  USUARIO = 'USUARIO',
  MODERADOR = 'MODERADOR',
  ADMIN = 'ADMIN',
}

/** Nível numérico para checagem hierárquica de papéis. */
export const NIVEL_PAPEL: Record<Papel, number> = {
  [Papel.USUARIO]: 1,
  [Papel.MODERADOR]: 2,
  [Papel.ADMIN]: 3,
};
