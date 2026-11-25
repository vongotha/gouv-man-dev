import { onRequest } from '../functions/api/contact.js';

/**
 * Worker d'hébergement du site statique Astro.
 *
 * - Les assets de `dist/` sont servis par le binding ASSETS.
 * - `/api/contact` est traité par la même logique que la Pages Function,
 *   afin de conserver un seul point de vérité pour l'envoi Resend.
 * - `run_worker_first = ["/api/*"]` garantit que l'API n'est pas interceptée
 *   par un asset statique.
 */
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname.replace(/\/+$/, '') || '/';

    if (pathname === '/api/contact') {
      return onRequest({
        request,
        env,
        params: {},
        data: {},
        next: () => env.ASSETS.fetch(request),
        waitUntil: (promise) => ctx.waitUntil(promise),
      });
    }

    return env.ASSETS.fetch(request);
  },
};
