import { Prisma } from '@prisma/client';

/**
 * True quando o erro é violação de constraint UNIQUE do Prisma (P2002).
 * Usado como backstop de corrida no check-then-create: se duas requisições
 * concorrentes passam pelo findUnique, o banco rejeita a 2ª com P2002 e o
 * service a remapeia para o 409 de domínio.
 */
export function ehViolacaoUnica(erro: unknown): boolean {
  return erro instanceof Prisma.PrismaClientKnownRequestError && erro.code === 'P2002';
}
