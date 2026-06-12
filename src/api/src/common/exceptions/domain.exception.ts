import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Exceção de domínio com código estável para o envelope de erro.
 * O ExceptionFilter a converte em { error: { code, message, details } }.
 */
export class DomainException extends HttpException {
  constructor(
    public readonly code: string,
    message: string,
    status: HttpStatus,
    public readonly details: unknown[] = [],
  ) {
    super({ code, message, details }, status);
  }
}

export class NaoEncontradoException extends DomainException {
  constructor(code: string, message: string) {
    super(code, message, HttpStatus.NOT_FOUND);
  }
}

export class ConflitoException extends DomainException {
  constructor(code: string, message: string) {
    super(code, message, HttpStatus.CONFLICT);
  }
}

export class RegraNegocioException extends DomainException {
  constructor(code: string, message: string, details: unknown[] = []) {
    super(code, message, HttpStatus.UNPROCESSABLE_ENTITY, details);
  }
}

export class OwnershipException extends DomainException {
  constructor(message = 'Você não tem permissão sobre este recurso.') {
    super('OWNERSHIP_NEGADO', message, HttpStatus.FORBIDDEN);
  }
}

/** Falha ao consultar a RAWG (timeout, 4xx, 5xx). Nunca vaza detalhes da resposta. */
export class RawgIndisponivelException extends DomainException {
  constructor() {
    super(
      'CATALOGO_INDISPONIVEL',
      'Não foi possível consultar o catálogo de jogos no momento.',
      HttpStatus.BAD_GATEWAY,
    );
  }
}
