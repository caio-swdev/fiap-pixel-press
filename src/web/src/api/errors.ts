/**
 * Tratamento central do envelope de erro do backend:
 *   { "error": { "code", "message", "details" } }
 * Normaliza qualquer falha do axios num ApiError e mapeia `code` para
 * mensagens amigáveis quando faz sentido.
 */

export interface EnvelopeErro {
  error: {
    code: string;
    message: string;
    details?: unknown[];
  };
}

export class ApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
    public readonly details: string[] = [],
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/** Mensagens amigáveis por código de domínio. Fallback: mensagem do backend. */
const MENSAGENS_AMIGAVEIS: Record<string, string> = {
  REVIEW_DUPLICADA: 'Você já avaliou este jogo. Edite sua review existente.',
  ITEM_BIBLIOTECA_DUPLICADO: 'Este jogo já está na sua biblioteca.',
  NOTA_INVALIDA: 'A nota precisa ser um número inteiro de 0 a 10.',
  OWNERSHIP_NEGADO: 'Você não tem permissão sobre este recurso.',
  ACESSO_NEGADO: 'Seu papel não permite esta ação.',
  // NAO_AUTENTICADO não é remapeado: na falha de login, preserva a mensagem do
  // backend ("Credenciais inválidas."). Sessão expirada é tratada no interceptor.
  EMAIL_DUPLICADO: 'Já existe uma conta com este e-mail.',
  CATALOGO_INDISPONIVEL: 'O catálogo está indisponível no momento. Tente novamente.',
  REGRA_NEGOCIO: 'A operação viola uma regra de negócio.',
};

export function mensagemAmigavel(code: string, fallback: string): string {
  return MENSAGENS_AMIGAVEIS[code] ?? fallback;
}

function ehEnvelope(data: unknown): data is EnvelopeErro {
  return (
    typeof data === 'object' &&
    data !== null &&
    'error' in data &&
    typeof (data as { error: unknown }).error === 'object' &&
    (data as { error: { code?: unknown } }).error !== null &&
    typeof (data as { error: { code?: unknown } }).error.code === 'string'
  );
}

/** Converte o erro bruto do axios num ApiError estável. */
export function normalizarErro(status: number | undefined, data: unknown): ApiError {
  if (ehEnvelope(data)) {
    const { code, message, details } = data.error;
    const detalhes = Array.isArray(details)
      ? details.map((d) => (typeof d === 'string' ? d : JSON.stringify(d)))
      : [];
    return new ApiError(code, mensagemAmigavel(code, message), status ?? 0, detalhes);
  }
  if (status === undefined) {
    return new ApiError(
      'SEM_CONEXAO',
      'Não foi possível falar com o servidor. Verifique se o backend está no ar.',
      0,
    );
  }
  return new ApiError('ERRO', 'Ocorreu um erro inesperado.', status);
}
