# Guide d'utilisation de la console d'administration

Ce site utilise **Pages CMS** comme console d'administration. Vous modifiez les textes, les images, les actualités et les communiqués dans une interface simple ; les changements sont enregistrés dans le dépôt GitHub, puis le site est reconstruit automatiquement sur Cloudflare Pages.

## 1. Se connecter

1. Ouvrir [pagescms.org](https://pagescms.org).
2. Cliquer sur **Sign in with GitHub**.
3. Accepter l'invitation envoyée par l'équipe technique, si nécessaire.
4. Sélectionner le dépôt du site, puis la branche `main`.

L'écran d'accueil de Pages CMS affiche :

- **Réglages du site** : nom, logo, email, téléphone, adresse, horaires, réseaux sociaux.
- **Accueil** : bandeau principal, section À la une, missions, bandeau de contact.
- **Le Gouvernement** : mission, valeurs, institutions, territoires, citation.
- **Nos missions** : missions et domaines d'intervention.
- **Page Actualités** et **Page Communiqués** : titres et introductions des listes.
- **Contact** : formulaire, coordonnées, demandes officielles.
- **Actualités** : liste des articles.
- **Communiqués** : liste des communiqués.

## 2. Modifier une page

1. Ouvrir la rubrique souhaitée.
2. Modifier les champs.
3. Cliquer sur **Save** / **Enregistrer**.
4. Attendre environ 1 à 2 minutes que Cloudflare Pages reconstruise le site.
5. Recharger la page du site pour vérifier.

Les textes sont saisis en **paragraphes simples** sur les pages. Les articles et communiqués disposent d'un éditeur **rich-text** pour les titres, listes, liens et citations.

## 3. Ajouter une actualité

1. Ouvrir **Actualités** dans le menu de gauche.
2. Cliquer sur **Add** / **Ajouter**.
3. Renseigner :
   - **Titre** ;
   - **Date** ;
   - **Catégorie** : Vie institutionnelle, Sur le terrain, Sensibilisation ou Coopération ;
   - **Chapô / description** : résumé affiché sur les cartes ;
   - **Image** et **texte alternatif** ;
   - **Temps de lecture** ;
   - **Mettre à la une** : active l'article principal de l'accueil ;
   - **Contenu de l'article** dans l'éditeur.
4. Enregistrer.

Le nom du fichier est généré automatiquement à partir du titre. L'article apparaît sur `/actualites/` et, s'il est à la une, sur l'accueil.

## 4. Ajouter un communiqué

1. Ouvrir **Communiqués**.
2. Cliquer sur **Add**.
3. Renseigner le titre, la date, le type, le résumé, l'image, le texte alternatif et le contenu.
4. Enregistrer.

Le communiqué apparaît sur `/communiques/` et dans la colonne « Derniers communiqués » de l'accueil.

## 5. Changer une image

1. Ouvrir le champ image concerné.
2. Cliquer sur le bouton d'upload / de sélection.
3. Choisir une image JPG, PNG, WebP, AVIF ou SVG.
4. Renseigner le **texte alternatif** : une courte description de l'image pour les personnes utilisant un lecteur d'écran.
5. Enregistrer.

Les images sont stockées dans `public/images/` et affichées avec le chemin `/images/...`. Pour de meilleurs résultats, utiliser des images de largeur comprise entre 1 200 et 2 000 pixels.

## 6. Ajouter ou retirer un élément

Les listes (missions, valeurs, institutions, territoires, réseaux sociaux…) disposent de boutons **Add** / **Remove**. L'ordre des éléments dans la liste correspond à l'ordre d'affichage sur le site.

## 7. Ce qu'il ne faut pas modifier

- Les fichiers de code (`src/`, `functions/`, `astro.config.mjs`).
- Le fichier `.pages.yml`.
- Les variables d'environnement Cloudflare.
- Le domaine d'envoi Resend.

En cas de doute, demander à l'équipe technique avant de modifier un réglage technique.

## 8. Vérifier après publication

- Le site s'ouvre correctement sur ordinateur et sur téléphone.
- Les images s'affichent.
- Les liens du menu fonctionnent.
- Les actualités et communiqués apparaissent dans les bonnes listes.
- Le formulaire de contact envoie bien un email.
- Les textes ne contiennent pas de faute visible.

## 9. En cas de problème

- **Le changement n'apparaît pas** : attendre la fin du déploiement Cloudflare, puis recharger avec `Ctrl + F5`.
- **Le site affiche une erreur après une modification** : un champ obligatoire est probablement vide ou un lien est invalide. Corriger le champ, ou revenir à la version précédente dans l'historique GitHub.
- **Un article n'apparaît pas à la une** : vérifier que le champ « Mettre à la une » est activé et qu'un seul article est sélectionné.
- **Le formulaire ne répond pas** : vérifier la configuration Resend avec l'équipe technique.
- **Besoin de revenir en arrière** : Cloudflare Pages conserve les déploiements précédents ; un rollback est possible depuis le dashboard Cloudflare.

## 10. Contacts

Pour toute question sur la console ou le site, contacter l'équipe technique responsable du déploiement.
