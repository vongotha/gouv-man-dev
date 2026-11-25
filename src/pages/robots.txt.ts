import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  const base = site ?? new URL('https://gouvernement-du-maniema.pages.dev');
  const sitemap = new URL('sitemap-index.xml', base).toString();

  return new Response(
    `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${sitemap}\n`,
    {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    },
  );
};
