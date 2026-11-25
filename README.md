# Gouvernement du Maniema — site officiel

Site vitrine statique du Gouvernement provincial du Maniema, construit avec **Astro**, **Tailwind CSS** et déployable gratuitement sur **Cloudflare Pages**.

- Accueil éditorial, Le Gouvernement, Nos missions, Actualités, Communiqués, Contact
- Pages de détail pour les actualités et communiqués
- Contenu éditable sans code via **Pages CMS** (`.pages.yml`)
- Formulaire de contact fonctionnel via **Cloudflare Pages Functions + Resend**
- Design institutionnel vert et blanc, responsive et accessible
- Polices **DM Sans** et **Lora** auto-hébergées
- Aucun framework client lourd, aucun serveur à maintenir

## Démarrage local

```bash
npm install
npm run dev
```

Le site est disponible sur `http://localhost:4321`.

Pour tester le formulaire en local, il faut lancer le build avec Wrangler (Astro seul ne lance pas les Functions) :

```bash
cp .dev.vars.example .dev.vars
# renseigner RESEND_API_KEY, CONTACT_EMAIL et CONTACT_FROM dans .dev.vars
npm run preview
```

`npm run preview` construit le site puis lance `wrangler pages dev dist` sur `http://localhost:8788`.

### Commandes

| Commande | Rôle |
|---|---|
| `npm run dev` | Serveur de développement Astro |
| `npm run build` | Génère le site dans `dist/` |
| `npm run preview` | Build + Cloudflare Pages Functions en local |
| `npm run check` | Vérification TypeScript / Astro |
| `npm run deploy` | Déploiement direct avec Wrangler |

## Variables d'environnement

À configurer dans **Cloudflare Pages → Settings → Environment variables** (et dans `.dev.vars` en local).

| Variable | Requis | Exemple | Rôle |
|---|---|---|---|
| `RESEND_API_KEY` | Oui | `re_...` | Clé API Resend (secrète) |
| `CONTACT_EMAIL` | Oui | `contact@domaine.cd` | Destinataire(s), séparés par des virgules |
| `CONTACT_FROM` | Oui | `Gouvernement du Maniema <contact@domaine.cd>` | Expéditeur, sur un domaine vérifié dans Resend |
| `SITE_URL` | Oui au build | `https://gouvernement-du-maniema.cd` | Canonical, sitemap, Open Graph |
| `ALLOWED_ORIGINS` | Non | `https://preview...pages.dev` | Origines autorisées pour les appels cross-origin |

> `CONTACT_FROM` doit utiliser un domaine vérifié dans Resend. En mode test, `onboarding@resend.dev` ne peut envoyer qu'à l'adresse du compte Resend.

## Configuration Resend

1. Créer un compte sur [resend.com](https://resend.com).
2. Ajouter le domaine d'envoi et configurer les enregistrements DNS demandés (SPF/DKIM).
3. Créer une clé API dans **API Keys**.
4. Renseigner `RESEND_API_KEY`, `CONTACT_EMAIL` et `CONTACT_FROM` dans Cloudflare Pages.
5. Tester le formulaire depuis le site déployé.

La Function appelle directement `https://api.resend.com/emails` avec `fetch`, sans SDK.

## Déploiement Cloudflare Pages

1. Pousser le projet sur GitHub.
2. Dans Cloudflare, créer un projet **Pages** connecté au dépôt.
3. Configuration du build :
   - Framework preset : **None / Astro**
   - Build command : `npm run build`
   - Build output directory : `dist`
   - Root directory : `/` (ou `app-web` si le dépôt est un monorepo)
   - Node version : `22` (variable `NODE_VERSION=22`)
4. Ajouter les variables d'environnement ci-dessus.
5. Déployer.

Les Functions sont détectées automatiquement depuis le dossier `functions/` à la racine du projet. L'endpoint est `POST /api/contact`.

> Le **Direct Upload** par glisser-déposer dans le dashboard Cloudflare ne prend pas en charge les Functions. Utilisez l'intégration Git ou `wrangler pages deploy` pour que le formulaire fonctionne.

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
6. Chaque sauvegarde crée un commit. Cloudflare Pages reconstruit automatiquement le site.

Les images uploadées sont enregistrées dans `public/images/` et utilisées avec le chemin `/images/...`.

> Le site est volontairement structuré en sections prédéfinies : le client peut modifier les contenus, les listes et les articles, mais ne peut pas casser la mise en page globale. Les articles utilisent l'éditeur rich-text de Pages CMS.

## Structure du projet

```txt
.
├── .pages.yml                  # Configuration de la console Pages CMS
├── functions/api/contact.js    # Function Cloudflare → Resend
├── public/
│   ├── _headers                # Sécurité et cache Cloudflare Pages
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
│   └── styles/global.css       # Design system Tailwind
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

La Function `functions/api/contact.js` :

- accepte `POST` en JSON (le formulaire envoie du JSON) ;
- accepte aussi `application/x-www-form-urlencoded` et `multipart/form-data` pour les tests ;
- valide le nom, l'email et le message ;
- ignore silencieusement les soumissions avec honeypot ;
- limite la taille des requêtes ;
- échappe le HTML avant de construire l'email ;
- renvoie des erreurs JSON lisibles, utilisées par le formulaire pour afficher les messages.

Exemple de test local :

```bash
curl -X POST http://localhost:8788/api/contact \
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
- `_headers` ajoute les en-têtes de sécurité et les règles de cache.
- `_headers` ne s'applique pas aux réponses des Functions : la Function ajoute ses propres en-têtes.
- Pour limiter le spam en production, ajouter une règle de rate limiting Cloudflare WAF sur `POST /api/contact` (par exemple 5 requêtes/minute/IP).
- Aucun message n'est stocké en base : la Function envoie uniquement un email via Resend.

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
| `404` sur `/api/contact` | Functions non déployées | Utiliser Git ou `wrangler pages deploy`, pas le drag & drop |
| `500` à l'envoi | Variables Resend manquantes | Vérifier `RESEND_API_KEY`, `CONTACT_EMAIL`, `CONTACT_FROM` |
| Resend refuse l'email | Domaine non vérifié | Vérifier le domaine et l'expéditeur dans Resend |
| Formulaire bloqué en local | Wrangler non lancé | Utiliser `npm run preview`, pas `npm run dev` seul |
| Erreur CORS | Origine non autorisée | Ajouter l'URL exacte dans `ALLOWED_ORIGINS` |
| Une actualité n'apparaît pas | Collection non reconstruite / date future | Vérifier le contenu et relancer le build |
| Le client ne voit pas ses changements | Commit non poussé / build en cours | Vérifier GitHub et l'onglet Deployments Cloudflare |

## Crédits

Site institutionnel du Gouvernement provincial du Maniema. Les illustrations SVG fournies sont des visuels de démonstration, remplaçables par des photographies officielles.
