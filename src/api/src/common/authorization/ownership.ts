import { DomainException, OwnershipException } from '../exceptions/domain.exception';

/**
 * Garante que a entidade existe (senão lança a exceção de não-encontrado dada)
 * e que pertence ao usuário (senão 403). Centraliza o padrão
 * findUnique → 404 → check dono → 403 repetido em reviews e biblioteca.
 */
export function garantirEncontradoEDono<T extends { usuarioId: string }>(
  entidade: T | null,
  naoEncontrada: DomainException,
  usuarioId: string,
  mensagemOwnership: string,
): T {
  if (!entidade) {
    throw naoEncontrada;
  }
  if (entidade.usuarioId !== usuarioId) {
    throw new OwnershipException(mensagemOwnership);
  }
  return entidade;
}
