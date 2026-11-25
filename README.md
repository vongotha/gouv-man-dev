# Gouvernement du Maniema — site officiel

Site vitrine statique du Gouvernement provincial du Maniema, construit avec **Astro**, **Tailwind CSS** et déployable sur **Cloudflare Workers** avec assets statiques. Une compatibilité Cloudflare Pages est conservée via le dossier `functions/`.

- Accueil éditorial, Le Gouvernement, Nos missions, Actualités, Communiqués, Contact
- Pages de détail pour les actualités et communiqués
- Contenu éditable sans code via **Pages CMS** (`.pages.yml`)
- Formulaire de contact fonctionnel via **Cloudflare Worker + Resend**
- Design institutionnel vert et blanc, responsive et accessible
- Polices **DM Sans** et **Lora** auto-hébergées
- Aucun framework client lourd, aucun serveur à maintenir

## Démarrage local

```bash
npm install
npm run dev
```

Le site est disponible sur `http://localhost:4321`.

Pour tester le site complet (assets + Worker + formulaire) :

```bash
cp .dev.vars.example .dev.vars
# renseigner RESEND_API_KEY, CONTACT_EMAIL et CONTACT_FROM
npm run preview
```

`npm run preview` construit le site puis lance `wrangler dev` sur `http://localhost:8787` avec le binding `ASSETS` et l'API `/api/contact`.

### Commandes

| Commande | Rôle |
|---|---|
| `npm run dev` | Serveur de développement Astro |
| `npm run build` | Génère le site dans `dist/` |
| `npm run preview` | Build + Worker Cloudflare en local (`wrangler dev`) |
| `npm run preview:pages` | Build + ancien mode Pages en local (`wrangler pages dev`) |
| `npm run check` | Vérification TypeScript / Astro |
| `npm run deploy` | Build + déploiement du Worker avec Wrangler |

## Architecture Worker

```toml
name = "gouvernement-du-maniema"
main = "./src/worker.js"
compatibility_date = "2026-11-01"

[assets]
directory = "./dist"
binding = "ASSETS"
not_found_handling = "404-page"
run_worker_first = ["/api/*"]
```

`src/worker.js` :

- sert tous les fichiers statiques de `dist/` via `env.ASSETS.fetch(request)` ;
- délègue `/api/contact` à `functions/api/contact.js`, afin de garder une seule logique Resend ;
- laisse Cloudflare gérer les assets, `_headers`, `_redirects` et la page 404.

Le Worker est accessible par défaut sur `https://gouvernement-du-maniema.<votre-sous-domaine>.workers.dev`, puis sur le domaine personnalisé configuré dans **Workers & Pages → votre Worker → Settings → Domains & Routes**.

## Variables d'environnement

### En local

Dans `.dev.vars` (ignoré par Git) :

```txt
RESEND_API_KEY=re_...
CONTACT_EMAIL=contact@domaine.cd
CONTACT_FROM=Gouvernement du Maniema <contact@domaine.cd>
```

### En production

Avec Wrangler :

```bash
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put CONTACT_EMAIL
npx wrangler secret put CONTACT_FROM
# optionnel
npx wrangler secret put ALLOWED_ORIGINS
```

Ou dans le dashboard Cloudflare : **Workers & Pages → Worker → Settings → Variables and Secrets**.

| Variable | Requis | Exemple | Rôle |
|---|---|---|---|
| `RESEND_API_KEY` | Oui | `re_...` | Clé API Resend (secrète) |
| `CONTACT_EMAIL` | Oui | `contact@domaine.cd` | Destinataire(s), séparés par des virgules |
| `CONTACT_FROM` | Oui | `Gouvernement du Maniema <contact@domaine.cd>` | Expéditeur, sur un domaine vérifié dans Resend |
| `SITE_URL` | Oui au build | `https://gouvernement-du-maniema.cd` | Canonical, sitemap, Open Graph |
| `ALLOWED_ORIGINS` | Non | `https://preview...workers.dev` | Origines autorisées pour les appels cross-origin |

`SITE_URL` est une variable de build Astro : elle doit être disponible au moment de `npm run build` (`SITE_URL=... npm run build`) ou configurée dans l'environnement de build CI.

> `CONTACT_FROM` doit utiliser un domaine vérifié dans Resend. En mode test, `onboarding@resend.dev` ne peut envoyer qu'à l'adresse du compte Resend.

## Déploiement Cloudflare Worker

1. Se connecter à Cloudflare :

```bash
npx wrangler login
```

2. Configurer les secrets (voir ci-dessus).

3. Construire et déployer :

```bash
SITE_URL=https://votre-domaine.cd npm run deploy
```

`npm run deploy` exécute `npm run build` puis `wrangler deploy`. La variable `SITE_URL` est transmise au build.

Ou séparément :

```bash
SITE_URL=https://votre-domaine.cd npm run build
npx wrangler deploy
```

4. Ajouter le domaine personnalisé dans le dashboard Worker.

5. Tester :

```bash
curl -I https://votre-domaine.cd/
curl -X POST https://votre-domaine.cd/api/contact \
  -H 'Content-Type: application/json' \
  -d '{"name":"Test","email":"test@example.com","message":"Message de test valide."}'
```

> `wrangler deploy` fonctionne maintenant car `wrangler.toml` contient `main = "./src/worker.js"` et le bloc `[assets]`. Il ne faut plus utiliser `wrangler pages deploy` comme commande principale.

## Alternative Cloudflare Pages

Le projet conserve `functions/api/contact.js` pour une utilisation Pages :

- créer un projet Pages connecté au dépôt ;
- build command : `npm run build` ;
- build output directory : `dist` ;
- root directory : `/` ou `app-web` ;
- Functions automatiques depuis `functions/`.

Pour Pages, utilisez l'intégration Git ou l'ancien mode local :

```bash
npm run preview:pages
```

La configuration `wrangler.toml` étant désormais orientée Worker, le déploiement Pages doit se faire via l'intégration Git Cloudflare ou un projet Pages séparé. Le Worker reste la cible principale de ce dépôt.

## Configuration Resend

1. Créer un compte sur [resend.com](https://resend.com).
2. Ajouter le domaine d'envoi et configurer les enregistrements DNS demandés (SPF/DKIM).
3. Créer une clé API dans **API Keys**.
4. Renseigner `RESEND_API_KEY`, `CONTACT_EMAIL` et `CONTACT_FROM`.
5. Tester le formulaire depuis le site déployé.

La logique contact appelle directement `https://api.resend.com/emails` avec `fetch`, sans SDK.

## Console d'administration (Pages CMS)

La console d'administration est **Pages CMS**, un CMS Git gratuit : le client modifie les textes, les images, les actualités et les communiqués dans une interface visuelle, et les changements sont commités sur GitHub.

Un guide pas à pas destiné au client est disponible dans [`GUIDE_ADMIN.md`](./GUIDE_ADMIN.md).

### Mise en place

1. Pousser le dépôt sur GitHub.
2. Aller sur [pagescms.org](https://pagescms.org), se connecter avec GitHub.
3. Installer l'application GitHub de Pages CMS sur le dépôt.
4. Ouvrir le dépôt dans Pages CMS : la configuration `.pages.yml` est lue automatiquement.
5. Le client peut modifier :
   - **Réglages du site** : nom, logo, email, téléphone, adresse, horaires, réseaux sociaux.
   - **Accueil** : hero, section À la une, missions, bandeau de contact.
   - **Le Gouvernement** : mission, valeurs, institutions, territoires, citation.
   - **Nos missions** : missions, domaines d'intervention.
   - **Page Actualités / Page Communiqués** : titres et introductions.
   - **Contact** : formulaire, coordonnées, demandes officielles.
   - **Actualités** : collection d'articles avec titre, date, catégorie, image, contenu riche, mise à la une.
   - **Communiqués** : collection de communiqués avec titre, date, type, image, contenu.
6. Chaque sauvegarde crée un commit. Le déploiement du Worker doit être déclenché par votre CI ou par `npm run deploy`.

Les images uploadées sont enregistrées dans `public/images/` et utilisées avec le chemin `/images/...`.

> Le site est volontairement structuré en sections prédéfinies : le client peut modifier les contenus, les listes et les articles, mais ne peut pas casser la mise en page globale. Les articles utilisent l'éditeur rich-text de Pages CMS.

## Structure du projet

```txt
.
├── .pages.yml                  # Configuration de la console Pages CMS
├── functions/api/contact.js    # Logique contact partagée (Worker + Pages)
├── public/
│   ├── _headers                # Sécurité et cache
│   ├── _redirects              # Redirections des anciennes routes
│   └── images/                 # Illustrations et images du CMS
├── src/
│   ├── components/             # Header, Footer, cartes, article, formulaire…
│   ├── content/
│   │   ├── actualites/         # Articles Markdown
│   │   └── communiques/        # Communiqués Markdown
│   ├── content.config.ts       # Schémas des collections
│   ├── data/                   # Contenus des pages éditables
│   ├── layouts/BaseLayout.astro
│   ├── lib/content.ts          # Schémas Zod et chargement des pages
│   ├── pages/                  # Routes du site
│   ├── styles/global.css       # Design system Tailwind
│   └── worker.js               # Worker Cloudflare (assets + API)
├── astro.config.mjs
├── wrangler.toml
└── README.md
```

### Routes

```txt
/                         Accueil
/gouvernement/            Le Gouvernement
/missions/                Nos missions
/actualites/              Liste des actualités
/actualites/[slug]/       Détail d'une actualité
/communiques/             Liste des communiqués
/communiques/[slug]/      Détail d'un communiqué
/contact/                 Contact
```

Les anciennes routes `/services/` et `/a-propos/` redirigent vers `/missions/` et `/gouvernement/` via `_redirects`.

## Formulaire de contact

La logique `functions/api/contact.js` :

- accepte `POST` en JSON (le formulaire envoie du JSON) ;
- accepte aussi `application/x-www-form-urlencoded` et `multipart/form-data` pour les tests ;
- valide le nom, l'email et le message ;
- ignore silencieusement les soumissions avec honeypot ;
- limite la taille des requêtes ;
- échappe le HTML avant de construire l'email ;
- renvoie des erreurs JSON lisibles, utilisées par le formulaire pour afficher les messages.

Elle est appelée par :

- `src/worker.js` pour le déploiement Worker ;
- `functions/api/contact.js` pour un déploiement Pages.

Exemple de test local :

```bash
curl -X POST http://localhost:8787/api/contact \
  -H 'Content-Type: application/json' \
  -d '{"name":"Test Citoyen","email":"test@example.com","message":"Ceci est un message de test."}'
```

## Recherche et filtres

La page **Actualités** propose :

- un filtre par catégorie ;
- une recherche plein texte côté client ;
- la prise en charge du paramètre `?q=...` utilisé par la recherche du header.

Tout fonctionne sans backend et sans JavaScript lourd. Les articles restent visibles sans JS (les filtres sont une amélioration progressive).

## Newsletter

La maquette initiale utilisait un formulaire de newsletter stocké en `localStorage`. Il a été remplacé par un **bandeau de contact** qui renvoie vers la page Contact, afin de ne pas afficher un faux abonnement. Pour une vraie newsletter, il faudra intégrer un outil dédié (Brevo, Mailchimp, etc.) ou un endpoint spécifique.

## Sécurité et bonnes pratiques

- Ne jamais committer `.dev.vars` ni `.env`.
- Les secrets sont stockés dans Cloudflare, pas dans le code.
- `_headers` ajoute les en-têtes de sécurité et les règles de cache pour les assets statiques.
- Les réponses du Worker (`/api/contact`) ajoutent leurs propres en-têtes, car `_headers` ne s'applique pas aux réponses générées par le Worker.
- Pour limiter le spam en production, ajouter une règle de rate limiting Cloudflare sur `POST /api/contact` (par exemple 5 requêtes/minute/IP).
- Aucun message n'est stocké en base : la logique contact envoie uniquement un email via Resend.

## À personnaliser avant mise en ligne

Les contenus de démonstration sont fonctionnels, mais ces valeurs doivent être remplacées par les informations officielles :

- nom exact de l'institution et mentions officielles ;
- adresse email et numéro de téléphone ;
- adresse postale et horaires ;
- logo officiel (via Pages CMS ou `public/images/emblem.svg`) ;
- textes, actualités, communiqués, chiffres et citations ;
- photos officielles (les illustrations SVG sont des visuels de démonstration) ;
- domaine `SITE_URL` et domaine d'envoi Resend.

## Dépannage

| Problème | Cause probable | Solution |
|---|---|---|
| `wrangler deploy` demande un `main` | Ancienne configuration Pages | Vérifier que `wrangler.toml` contient `main` et `[assets]` |
| `404` sur `/api/contact` | Worker non déployé ou route non prise | Vérifier `run_worker_first` et redéployer |
| `500` à l'envoi | Variables Resend manquantes | Vérifier les secrets Worker |
| Resend refuse l'email | Domaine non vérifié | Vérifier le domaine et l'expéditeur dans Resend |
| Formulaire bloqué en local | `wrangler dev` non lancé | Utiliser `npm run preview` |
| Erreur CORS | Origine non autorisée | Ajouter l'URL exacte dans `ALLOWED_ORIGINS` |
| Une actualité n'apparaît pas | Collection non reconstruite / date future | Vérifier le contenu et relancer le build |
| Le client ne voit pas ses changements | Commit non poussé / build en cours | Vérifier GitHub et le déploiement Cloudflare |

## Crédits

Site institutionnel du Gouvernement provincial du Maniema. Les illustrations SVG fournies sont des visuels de démonstration, remplaçables par des photographies officielles.
