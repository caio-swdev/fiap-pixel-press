import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface EnvelopeErro {
  error: {
    code: string;
    message: string;
    details: unknown[];
  };
}

/**
 * Filtro global. Toda exceção sai no envelope:
 *   { "error": { "code", "message", "details" } }
 * com o status HTTP semântico de standards.md.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { status, envelope } = this.mapear(exception);

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        { code: envelope.error.code, path: request.url, method: request.method },
        exception instanceof Error ? exception.stack : 'Erro desconhecido',
      );
    }

    response.status(status).json(envelope);
  }

  private mapear(exception: unknown): { status: number; envelope: EnvelopeErro } {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const resposta = exception.getResponse();
      return { status, envelope: this.envelopeDeHttpException(status, resposta) };
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      envelope: {
        error: {
          code: 'ERRO_INTERNO',
          message: 'Ocorreu um erro inesperado.',
          details: [],
        },
      },
    };
  }

  private envelopeDeHttpException(status: number, resposta: unknown): EnvelopeErro {
    // Exceções de domínio: já vêm como { code, message, details }.
    if (this.ehEnvelopeDominio(resposta)) {
      return {
        error: {
          code: resposta.code,
          message: resposta.message,
          details: resposta.details ?? [],
        },
      };
    }

    // ValidationPipe e exceções Nest padrão: { statusCode, message, error }.
    if (typeof resposta === 'object' && resposta !== null && 'message' in resposta) {
      const r = resposta as { message: unknown };
      const details = Array.isArray(r.message) ? r.message : [];
      const message = Array.isArray(r.message)
        ? 'Falha de validação na requisição.'
        : String(r.message);
      return {
        error: { code: this.codeDeStatus(status), message, details },
      };
    }

    return {
      error: {
        code: this.codeDeStatus(status),
        message: typeof resposta === 'string' ? resposta : 'Erro na requisição.',
        details: [],
      },
    };
  }

  private ehEnvelopeDominio(
    resposta: unknown,
  ): resposta is { code: string; message: string; details?: unknown[] } {
    return (
      typeof resposta === 'object' &&
      resposta !== null &&
      'code' in resposta &&
      'message' in resposta &&
      typeof (resposta as { code: unknown }).code === 'string'
    );
  }

  private codeDeStatus(status: number): string {
    const mapa: Record<number, string> = {
      [HttpStatus.BAD_REQUEST]: 'REQUISICAO_INVALIDA',
      [HttpStatus.UNAUTHORIZED]: 'NAO_AUTENTICADO',
      [HttpStatus.FORBIDDEN]: 'ACESSO_NEGADO',
      [HttpStatus.NOT_FOUND]: 'NAO_ENCONTRADO',
      [HttpStatus.METHOD_NOT_ALLOWED]: 'METODO_NAO_PERMITIDO',
      [HttpStatus.CONFLICT]: 'CONFLITO',
      [HttpStatus.UNPROCESSABLE_ENTITY]: 'REGRA_NEGOCIO',
      [HttpStatus.BAD_GATEWAY]: 'CATALOGO_INDISPONIVEL',
    };
    return mapa[status] ?? 'ERRO';
  }
}
