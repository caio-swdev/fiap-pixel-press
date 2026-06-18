/**
 * Pub/sub mínimo para o aviso de "servidor acordando" (cold start do Render free).
 *
 * No plano free o container da API hiberna após ~15 min ocioso. A próxima chamada
 * NÃO falha: ela fica pendurada ~50s enquanto o container sobe e então responde.
 * O sinal de cold start é, portanto, LATÊNCIA, não erro.
 *
 * O interceptor do axios (em api/http.ts) mede o tempo de cada request: se alguma
 * passar de WARMUP_THRESHOLD_MS sem responder, dispara show(); quando todas as
 * lentas respondem, dispara hide(). O <WarmupOverlay> renderiza o estado.
 */

type Listener = (visivel: boolean) => void;

const listeners = new Set<Listener>();
let visivel = false;

export const warmupBus = {
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    listener(visivel); // estado atual ao montar
    return () => listeners.delete(listener);
  },
  mostrar(): void {
    if (visivel) return;
    visivel = true;
    listeners.forEach((l) => l(true));
  },
  esconder(): void {
    if (!visivel) return;
    visivel = false;
    listeners.forEach((l) => l(false));
  },
};

/** Acima disto, uma chamada pendente é tratada como cold start (resposta normal < 1s). */
export const WARMUP_THRESHOLD_MS = 3000;
