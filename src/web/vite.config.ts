import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

/**
 * O backend já entregue não habilita CORS (main.ts sem enableCors). Para falar com
 * ele a partir do browser sem tocar no backend, o dev server faz proxy de /api → backend.
 * Assim a SPA chama same-origin (/api/v1/...) e o Vite encaminha server-side.
 *
 * Alvo do proxy vem de VITE_PROXY_TARGET (porta nunca hardcoded em código).
 * Em produção, basta apontar VITE_API_BASE_URL para a URL absoluta do backend (com CORS).
 */
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const proxyTarget = env.VITE_PROXY_TARGET ?? 'http://localhost:3000';

  return {
    plugins: [react()],
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
        },
      },
    },
  };
});
