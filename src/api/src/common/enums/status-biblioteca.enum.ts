/**
 * Status de um item da biblioteca. Fonte de verdade do domínio
 * (SQLite não suporta enum nativo; persistido como String, validado com @IsEnum).
 */
export enum StatusBiblioteca {
  JOGANDO = 'JOGANDO',
  ZERADO = 'ZERADO',
  QUERO_JOGAR = 'QUERO_JOGAR',
  DROPEI = 'DROPEI',
  PLATINADO = 'PLATINADO',
}
