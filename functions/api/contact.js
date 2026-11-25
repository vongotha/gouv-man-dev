const RESEND_ENDPOINT = 'https://api.resend.com/emails';
const MAX_BODY_BYTES = 25_000;

const baseHeaders = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
};

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function singleLine(value) {
  return String(value).replace(/[\r\n]+/g, ' ').trim();
}

function respond(data, status, corsHeaders, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...baseHeaders,
      ...corsHeaders,
      ...extraHeaders,
    },
  });
}

function corsHeadersFor(request, env) {
  const origin = request.headers.get('Origin');
  if (!origin) return {};

  let originUrl;
  try {
    originUrl = new URL(origin);
  } catch {
    return null;
  }

  const requestHost = new URL(request.url).host;
  const allowedOrigins = String(env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  const sameOrigin = originUrl.host === requestHost;
  const explicitlyAllowed = allowedOrigins.includes(origin);

  if (!sameOrigin && !explicitlyAllowed) return null;

  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Accept',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

async function readPayload(request) {
  const contentType = (request.headers.get('content-type') || '').toLowerCase();
  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength > MAX_BODY_BYTES) {
    return { error: 'La demande est trop volumineuse.', status: 413 };
  }

  if (contentType.includes('application/json')) {
    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) {
      return { error: 'La demande est trop volumineuse.', status: 413 };
    }

    try {
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        return { error: 'Le corps de la requête doit être un objet JSON.', status: 400 };
      }
      return { payload: parsed };
    } catch {
      return { error: 'Le corps JSON est invalide.', status: 400 };
    }
  }

  if (
    contentType.includes('application/x-www-form-urlencoded') ||
    contentType.includes('multipart/form-data')
  ) {
    try {
      const formData = await request.formData();
      const payload = {};
      for (const [key, value] of formData.entries()) {
        if (typeof value === 'string') payload[key] = value;
      }
      return { payload };
    } catch {
      return { error: 'Le formulaire est invalide.', status: 400 };
    }
  }

  return {
    error: 'Format non pris en charge. Utilisez JSON ou un formulaire HTML.',
    status: 415,
  };
}

function validate(payload) {
  const name = singleLine(payload.name || '');
  const email = singleLine(payload.email || '').toLowerCase();
  const message = String(payload.message || '').trim();
  const phone = singleLine(payload.phone || '');
  const subject = singleLine(payload.subject || '');
  const page = singleLine(payload.page || '');
  const fields = {};

  if (name.length < 2) {
    fields.name = 'Indiquez votre nom complet.';
  } else if (name.length > 100) {
    fields.name = 'Le nom ne doit pas dépasser 100 caractères.';
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    fields.email = 'Indiquez une adresse email valide.';
  } else if (email.length > 254) {
    fields.email = 'L’adresse email est trop longue.';
  }

  if (message.length < 10) {
    fields.message = 'Votre message doit contenir au moins 10 caractères.';
  } else if (message.length > 5000) {
    fields.message = 'Votre message ne doit pas dépasser 5 000 caractères.';
  }

  return { name, email, message, phone, subject, page, fields };
}

function emailContent({ name, email, message, phone, subject, page }) {
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safePhone = escapeHtml(phone);
  const safeSubject = escapeHtml(subject);
  const safePage = escapeHtml(page);
  const safeMessage = escapeHtml(message).replaceAll('\n', '<br />');
  let pageLabel = 'le site officiel';
  if (page) {
    try {
      pageLabel = new URL(page).hostname;
    } catch {
      pageLabel = page;
    }
  }

  const html = `<!doctype html>
<html lang="fr">
  <body style="margin:0;padding:0;background:#f5f2e9;font-family:Arial,Helvetica,sans-serif;color:#14221b;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5f2e9;padding:28px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#ffffff;border:1px solid #dfe8e2;border-radius:16px;overflow:hidden;">
            <tr>
              <td style="background:#0a271c;padding:24px 28px;color:#ffffff;">
                <p style="margin:0 0 6px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#d9ba6c;">Gouvernement du Maniema</p>
                <h1 style="margin:0;font-family:Georgia,serif;font-size:24px;font-weight:600;">Nouveau message depuis le site</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:28px;">
                <p style="margin:0 0 20px;font-size:13px;color:#5c6b63;">Un visiteur a envoyé un message via le formulaire de contact du site officiel${page ? ` (${safePage})` : ''}.</p>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-size:14px;line-height:1.6;">
                  <tr><td style="padding:8px 0;color:#5c6b63;width:90px;">Nom</td><td style="padding:8px 0;font-weight:700;">${safeName}</td></tr>
                  <tr><td style="padding:8px 0;color:#5c6b63;">Email</td><td style="padding:8px 0;"><a href="mailto:${safeEmail}" style="color:#1f5b43;">${safeEmail}</a></td></tr>
                  ${safePhone ? `<tr><td style="padding:8px 0;color:#5c6b63;">Téléphone</td><td style="padding:8px 0;">${safePhone}</td></tr>` : ''}
                  ${safeSubject ? `<tr><td style="padding:8px 0;color:#5c6b63;">Objet</td><td style="padding:8px 0;">${safeSubject}</td></tr>` : ''}
                  ${safePage ? `<tr><td style="padding:8px 0;color:#5c6b63;">Page</td><td style="padding:8px 0;word-break:break-all;">${safePage}</td></tr>` : ''}
                </table>
                <div style="margin-top:20px;padding:18px;background:#f8faf8;border-left:3px solid #1f5b43;border-radius:6px;font-size:14px;line-height:1.7;white-space:normal;">${safeMessage}</div>
                <p style="margin:24px 0 0;font-size:12px;color:#7b8881;">Message reçu depuis ${escapeHtml(pageLabel)}. Répondez directement à cet email pour joindre l’expéditeur.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const text = [
    'Nouveau message depuis le site du Gouvernement du Maniema',
    '',
    `Nom : ${name}`,
    `Email : ${email}`,
    phone ? `Téléphone : ${phone}` : null,
    subject ? `Objet : ${subject}` : null,
    page ? `Page : ${page}` : null,
    '',
    'Message :',
    message,
  ]
    .filter((line) => line !== null)
    .join('\n');

  return { html, text };
}

export async function onRequest(context) {
  const { request, env } = context;
  const corsHeaders = corsHeadersFor(request, env);

  if (corsHeaders === null) {
    return respond({ ok: false, error: 'Origine non autorisée.' }, 403, {});
  }

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: { ...baseHeaders, ...corsHeaders } });
  }

  if (request.method !== 'POST') {
    return respond({ ok: false, error: 'Méthode non autorisée.' }, 405, corsHeaders, {
      Allow: 'POST, OPTIONS',
    });
  }

  const parsed = await readPayload(request);
  if (parsed.error) {
    return respond({ ok: false, error: parsed.error }, parsed.status, corsHeaders);
  }

  const payload = parsed.payload;
  const honeypot = String(
    payload.website || payload.company || payload._gotcha || payload.hp || '',
  ).trim();
  if (honeypot) {
    // Ne pas révéler au robot que sa soumission a été ignorée.
    return respond(
      {
        ok: true,
        message: 'Votre message a bien été envoyé. Le Gouvernorat vous répondra dans les meilleurs délais.',
      },
      200,
      corsHeaders,
    );
  }

  const validated = validate(payload);
  if (Object.keys(validated.fields).length > 0) {
    return respond(
      {
        ok: false,
        error: 'Certains champs doivent être corrigés.',
        fields: validated.fields,
      },
      422,
      corsHeaders,
    );
  }

  const apiKey = String(env.RESEND_API_KEY || '').trim();
  const from = singleLine(env.CONTACT_FROM || '');
  const recipients = String(env.CONTACT_EMAIL || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  if (!apiKey || !from || recipients.length === 0) {
    console.error('Configuration email incomplète: RESEND_API_KEY, CONTACT_FROM et CONTACT_EMAIL sont requis.');
    return respond(
      {
        ok: false,
        error: 'Le service de contact n’est pas encore configuré. Merci de réessayer plus tard.',
      },
      500,
      corsHeaders,
    );
  }

  const { html, text } = emailContent(validated);
  const subject = singleLine(
    `Nouveau message du site — ${validated.name}${validated.subject ? ` — ${validated.subject}` : ''}`,
  ).slice(0, 180);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: recipients,
        subject,
        reply_to: validated.email,
        html,
        text,
      }),
      signal: controller.signal,
    });

    const responseBody = await response.text();
    if (!response.ok) {
      console.error('Resend a refusé l’envoi', response.status, responseBody.slice(0, 800));
      return respond(
        {
          ok: false,
          error: 'Le message n’a pas pu être envoyé pour le moment. Merci de réessayer plus tard.',
        },
        502,
        corsHeaders,
      );
    }

    return respond(
      {
        ok: true,
        message: 'Votre message a bien été envoyé. Le Gouvernorat vous répondra dans les meilleurs délais.',
      },
      200,
      corsHeaders,
    );
  } catch (error) {
    console.error('Erreur Resend ou réseau', error instanceof Error ? error.message : error);
    return respond(
      {
        ok: false,
        error: 'Le message n’a pas pu être envoyé pour le moment. Merci de réessayer plus tard.',
      },
      502,
      corsHeaders,
    );
  } finally {
    clearTimeout(timeout);
  }
}
