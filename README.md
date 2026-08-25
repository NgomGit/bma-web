# BMA — Baye Mor Automobile

Site du concessionnaire **BMA (Baye Mor Automobile)**, Dakar.
Next.js 16 · App Router · TypeScript · Tailwind v4 · Framer Motion.

---

## Démarrer

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # build de production
npm start        # serveur de production
```

---

## ⚠️ À remplacer avant la mise en ligne

| Quoi | Où |
|---|---|
| Numéro de téléphone et WhatsApp | `src/lib/site.ts` → `phone`, `phoneDisplay`, `whatsapp` |
| Adresse exacte du showroom | `src/lib/site.ts` → `address.street` |
| Domaine du site | `src/lib/site.ts` → `url` (sert au sitemap et aux métadonnées) |
| Photos des véhicules | `src/data/vehicles.ts` → champ `photos` (voir ci-dessous) |
| Chiffres clés (12 ans, 480 véhicules, 45 j) | `src/components/sections/Numbers.tsx` |
| Témoignages clients | `src/components/sections/Reviews.tsx` |

### Passer des silhouettes aux vraies photos

1. Déposer les images dans `public/vehicules/<slug>/01.jpg` — ratio **16/9**, largeur ≥ 1600 px.
2. Renseigner le tableau `photos` du véhicule dans `src/data/vehicles.ts` :

```ts
photos: ["/vehicules/toyota-hilux-double-cabine/01.jpg"],
```

`<VehicleVisual>` bascule automatiquement de la silhouette vectorielle vers la photo,
avec `next/image` (AVIF/WebP, chargement différé). Aucun autre fichier à toucher.

---

## Le parti pris sur l'arrière-plan

L'idée d'une grille est juste : c'est le langage du **plan technique**, celui des
notices d'atelier et des fiches de carrosserie. Elle est conservée.

Ce qui a été écarté : **une grille qui s'anime en permanence**. Trois raisons —
elle fatigue l'œil sur des pages longues, elle vide la batterie sur mobile
(repeindre le plein écran à 60 fps), et le mouvement continu évoque le jeu vidéo,
pas le showroom. Le luxe, visuellement, c'est la retenue.

Le compromis retenu : **la grille ne bouge jamais, c'est la lumière qui se déplace.**
`src/components/background/AmbientField.tsx` superpose trois couches :

1. **la trame de plan** — révélée uniquement dans un halo de 340 px autour du curseur ;
   ailleurs, elle n'existe pas. On la découvre en explorant la page.
2. **les repères larges** — une grille de 272 px, fixe, à peine perceptible, qui donne
   la sensation d'un fond dessiné plutôt que d'un aplat.
3. **le balayage de showroom** — une bande lumineuse diagonale qui traverse l'écran
   toutes les 13 secondes, comme un néon qui passe sur une carrosserie.

Coût réel : aucun `<canvas>`, aucune boucle d'animation permanente. Deux variables
CSS mises à jour dans une frame, et tout est désactivé si `prefers-reduced-motion`
est actif ou si l'appareil n'a pas de survol (mobile).

### Les autres effets « automobile »

| Effet | Où | Intention |
|---|---|---|
| **Cadrans** | `ui/Dial.tsx` | Les chiffres clés montent comme des aiguilles de compteur |
| **Ligne de scan** | `.scanline` (globals.css) | Une barre lumineuse traverse le véhicule au survol, comme un contrôle en atelier |
| **Reflet de carrosserie** | `.btn--primary::after` | Un éclat balaie les boutons — le reflet d'une aile au soleil |
| **Nuancier de teintes** | `SheetProvider.tsx` | Change réellement la couleur du tracé, comme un configurateur |
| **Lettrage fantôme** | Hero, fiche véhicule | La marque en contour derrière le véhicule, code des catalogues constructeurs |
| **Bande de roulement** | `.tread` (pied de page) | Séparateur en motif de pneu |
| **Sol de showroom** | `.stage::after` | Halo elliptique sous le véhicule, jamais une ombre portée dure |

---

## Structure

```
src/
├── app/
│   ├── layout.tsx              thème sans clignotement, polices locales, chrome
│   ├── page.tsx                page d'accueil + données structurées AutoDealer/FAQ
│   ├── globals.css             jetons de design, champ ambiant, primitives
│   ├── sitemap.ts · robots.ts  SEO technique
│   └── vehicules/[slug]/       fiche véhicule en page réelle (SSG + JSON-LD Car)
├── components/
│   ├── background/AmbientField.tsx
│   ├── brand/                  Logo, Seal, paths.ts (tracés vectorisés)
│   ├── layout/                 Header, Footer, MobileBar, ThemeToggle
│   ├── sections/               Hero, Selection, Fleet, Import, Numbers, …
│   ├── ui/                     Dial, Reveal, icons
│   └── vehicle/                VehicleVisual, VehicleCard, SheetProvider
├── data/                       vehicles.ts, faq.ts  ← tout le contenu éditable
└── lib/site.ts                 coordonnées et navigation
```

**Chaque véhicule existe à deux endroits** : un panneau rapide (`SheetProvider`)
pour consulter sans quitter la page, et une **vraie page** `/vehicules/<slug>`
pré-générée, indexable par Google et partageable sur WhatsApp. C'est ce qui
distingue un site de concessionnaire d'une page unique.

---

## Thème clair / sombre

Le thème est appliqué par un script inline **avant le premier rendu**
(`layout.tsx`), donc aucun clignotement au chargement. La préférence de l'appareil
est respectée par défaut, le choix de l'utilisateur est mémorisé en `localStorage`.

Tous les jetons vivent dans `globals.css` sous `html[data-theme="dark"]` et
`html[data-theme="light"]`. Pour ajuster une couleur, il n'y a qu'un endroit à toucher.

---

## Accessibilité

- Navigation complète au clavier, `:focus-visible` visible sur fond clair comme sombre.
- `prefers-reduced-motion` coupe le balayage, les apparitions et les compteurs.
- Cibles tactiles ≥ 44 px, zones sûres iOS gérées (`env(safe-area-inset-bottom)`).
- Panneau véhicule en `role="dialog"`, fermeture à la touche Échap.

---

## SEO — comment le site est construit pour être trouvé

### La cible réelle

Personne ne tape « voiture de plus de 10 millions » dans Google. Ce chiffre est un
**segment commercial**, pas une requête. Le site vise donc les recherches que les
acheteurs formulent réellement à Dakar, et utilise le plancher de 10 000 000 FCFA
comme **signal de positionnement** — pas comme mot-clé.

| Intention | Requête type | Page qui répond |
|---|---|---|
| Modèle précis | « Toyota Prado Dakar », « prix GLC Sénégal » | `/vehicules/<slug>` |
| Marque + ville | « Toyota occasion Dakar » | `/vehicules/marque/toyota` |
| Catégorie + ville | « SUV occasion Dakar », « pick-up Sénégal » | `/vehicules/categorie/suv-4x4` |
| Catalogue | « voiture occasion Dakar » | `/vehicules` |
| Service | « importer une voiture au Sénégal » | `/import-voiture-dakar` |
| Marque de la maison | « Baye Mor Automobile » | `/` |

### Ce qui a été mis en place

**Des pages, pas des ancres.** Le catalogue, chaque marque et chaque carrosserie ont
leur propre adresse indexable, avec un texte éditorial spécifique — Google ignore les
pages de liste sans contenu propre. Le site est passé de 13 à **plus de 25 pages
indexables**, toutes pré-générées.

**Des liens, pas du JavaScript.** Les grilles de ces pages sont rendues côté serveur
en vrais `<a>` vers les fiches. Le panneau rapide de la page d'accueil reste, mais il
ne remplace plus les liens : Google suit des liens, pas des gestionnaires de clic.

**Données structurées complètes** — `AutoDealer`, `Vehicle` (plus précis que `Car`
pour l'occasion), `ItemList`, `BreadcrumbList`, `FAQPage`, `Service`. Un seul graphe
JSON-LD par page, généré depuis `src/lib/seo.tsx`.

**Le plancher de prix est déclaré ET visible.** `priceSpecification.minPrice` vaut
10 000 000 FCFA dans le balisage, et la phrase apparaît noir sur blanc sur les pages.
Google sanctionne les données structurées qui ne correspondent pas au contenu affiché —
c'est pourquoi les deux vont ensemble. Si Baye Mor préfère ne pas afficher ce seuil,
retirez `PRICE_FLOOR_XOF` de `src/data/vehicles.ts` **et** les phrases correspondantes.

**Images de partage générées** pour chaque véhicule (`opengraph-image.tsx`). Un lien
collé dans WhatsApp affiche une carte avec la silhouette, le modèle, l'année, le
kilométrage et le téléphone. Au Sénégal où les fiches circulent d'abord par WhatsApp,
c'est le poste le plus rentable du référencement social.

**Titres calibrés** sous ~60 caractères pour ne pas être tronqués, descriptions
uniques par page, `canonical` partout, fil d'Ariane visible et balisé, maillage interne
croisé entre marques, catégories et fiches.

**`/admin` est exclu** du sitemap et bloqué dans `robots.txt`.

### Les trois actions hors code, par ordre d'impact

Le code ne fait que la moitié du travail. Par ordre de rentabilité pour un
concessionnaire à Dakar :

1. **Créer la fiche Google Business Profile** — c'est le levier n°1, très loin devant
   tout le reste. Les recherches « concessionnaire Dakar » affichent d'abord une carte
   avec trois établissements. Y figurer vaut plus que la première place organique.
   Nom exact, adresse, horaires, téléphone identiques à ceux du site, photos du
   showroom, et demande d'avis aux clients livrés.
2. **Mettre les vraies photos.** Google Images est un canal de recherche à part entière
   pour l'automobile, et une fiche sans photo ne convertit pas, quel que soit son rang.
3. **Déclarer le site dans Google Search Console** et y soumettre `/sitemap.xml`.
   C'est aussi là que vous verrez les requêtes réelles — et donc quelles pages de
   marque ou de catégorie méritent d'être étoffées.

⚠️ Renseignez `site.url` dans `src/lib/site.ts` avec le vrai domaine **avant** la mise
en ligne : toutes les URL canoniques, le sitemap et les images de partage en dépendent.

---

## Back-office `/admin`

Interface de gestion du parc — pensée pour être utilisée par le concessionnaire,
pas par un développeur.

### Accès

Chaque personne a son propre compte. Créer un fichier `.env.local` à la racine
(modèle dans `.env.example`) :

```bash
SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
SERVICE_ROLE_KEY=…            # Supabase → Settings → API → service_role
AUTH_SECRET=$(openssl rand -hex 32)
```

Puis se rendre sur `/admin` et entrer email + mot de passe. La session dure
7 jours dans un cookie `httpOnly` signé en HMAC-SHA256.

Le cookie ne contient que l'identifiant du compte et une date d'expiration : le
**rôle est relu en base à chaque requête**. Désactiver quelqu'un le met dehors à
la page suivante, sans attendre l'expiration du cookie.

⚠️ Sans `AUTH_SECRET`, la connexion est refusée — c'est volontaire.
`ADMIN_PASSWORD` n'existe plus : le mot de passe unique partagé a été remplacé
par des comptes nominatifs.

### Les deux rôles

| | Superadmin | Assistant |
|---|---|---|
| Ajouter, modifier, supprimer un véhicule | ✅ | ✅ |
| Téléverser et retirer des photos | ✅ | ✅ |
| Changer l'ordre du parc, mettre en avant | ✅ | ✅ |
| Créer, désactiver, supprimer des comptes | ✅ | ❌ |
| Réinitialiser le mot de passe d'autrui | ✅ | ❌ |
| Changer son propre mot de passe | ✅ | ✅ |

`/admin/utilisateurs` est réservé au superadmin. L'onglet n'apparaît pas pour un
assistant, et la page comme les actions vérifient le rôle côté serveur — masquer
un lien n'a jamais protégé quoi que ce soit.

**Désactiver plutôt que supprimer.** Un compte désactivé ne peut plus entrer mais
reste dans la liste, et se réactive d'un clic. La base refuse par ailleurs de
laisser le parc sans aucun superadmin actif : impossible de se verrouiller dehors.

**Mots de passe.** Hachés en scrypt (`node:crypto`), jamais stockés en clair.
Un mot de passe oublié ne se retrouve pas : le superadmin en génère un nouveau
depuis la liste des comptes, il s'affiche une seule fois, à dicter au téléphone.
Il ne transite pas par l'URL — il vit une minute dans un cookie `httpOnly`, pour
ne pas finir dans l'historique du navigateur ni dans les journaux de l'hébergeur.

### Ce qu'il permet

| Action | Où |
|---|---|
| Voir l'état du parc (mis en avant, sans photo) | `/admin` |
| Ajouter, modifier, dupliquer, supprimer un véhicule | `/admin/vehicules/…` |
| Téléverser des photos (JPG, PNG, WebP, AVIF — 8 Mo max) | bloc « Photos » de la fiche |
| Retirer une photo (le fichier part aussi du stockage) | croix au survol de la vignette |
| Mettre un véhicule en avant (carrousel d'accueil + rail « Sélection ») | bouton sur la liste |
| Changer l'ordre d'affichage sur le site | glisser-déposer d'une ligne par sa poignée ⠿ |
| Gérer les comptes | `/admin/utilisateurs` (superadmin) |
| Changer son mot de passe | `/admin/mon-compte` |

L'ordre de la liste **est** l'ordre du site. On attrape une ligne par la poignée à
gauche (le glissement ne part que de là, pour que la sélection de texte et le
défilement tactile restent normaux), on la lâche où l'on veut : l'affichage se met
à jour tout de suite et une seule sauvegarde part 700 ms après le dernier
déplacement. Au clavier, la poignée est focusable et répond à ↑ / ↓, chaque
déplacement étant annoncé aux lecteurs d'écran.

Toute modification **rafraîchit immédiatement le site public** — accueil, fiches
véhicules et `sitemap.xml` — sans redéploiement.

### Où vivent les données

Dans **Supabase** : une table `vehicles` pour le parc, une table `users` pour les
accès, un seau Storage `vehicules` pour les photos. Le schéma complet, commenté,
est dans **`supabase/schema.sql`** — à exécuter une fois dans Supabase → SQL Editor.

Les deux tables ont RLS activée **sans aucune policy**. Ce n'est pas un oubli :
sans policy, PostgREST refuse tout aux clés publiques, tandis que la clé
`service_role` contourne RLS. Or le site n'interroge la base que depuis le
serveur Next, avec cette clé. La base est donc fermée depuis l'extérieur, même
en connaissant l'URL du projet.

> **Sauvegarde** : Supabase sauvegarde la base automatiquement. Le seau `vehicules`
> se télécharge depuis l'interface Storage.

`src/lib/store.ts` reste le **seul** fichier qui sait où vivent les données. Ses six
fonctions (`getVehicles`, `getVehicle`, `putVehicle`, `removeVehicle`, `setOrder`,
`makeSlug`) sont l'unique interface : changer à nouveau de base ne toucherait que
ce fichier, plus `uploadPhoto` / `removePhoto` dans `src/app/admin/actions.ts` pour
les fichiers.

### Reprise des données (une seule fois)

```bash
# 1. Supabase → SQL Editor → coller supabase/schema.sql → Run
# 2. puis, à la racine du projet :
node scripts/migrate.mjs --email=vous@exemple.com --nom="Votre Nom"
```

Le script crée le seau, y envoie les photos de `public/vehicules/`, transfère
`data/vehicles.json` vers la table, crée le compte superadmin et affiche son mot
de passe. Il est ré-exécutable sans risque.

### Hébergement

Le back-office fonctionne désormais **partout**, Vercel compris : plus rien n'est
écrit sur le disque du serveur. C'était la limite précédente — le parc vivait dans
un fichier JSON, que Vercel refuse d'écrire, et chaque enregistrement finissait sur
une page d'erreur sans rien sauvegarder.

### Organisation des routes

```
src/app/
├── (site)/          site public — grille ambiante, en-tête, pied de page
├── admin/
│   ├── login/       accessible sans session
│   └── (dashboard)/ protégé : liste, création, édition
├── sitemap.ts · robots.ts
└── layout.tsx       racine minimale : polices, thème, styles
```

Les deux univers ont des layouts séparés : le back-office n'hérite ni de la grille
animée, ni de l'en-tête public, ni de la barre d'appel mobile.

---

## Déploiement

Le site est entièrement statique : `next build` génère 17 pages pré-rendues.
Vercel, Netlify ou tout hébergement Node fonctionne sans configuration.

```bash
npm run build && npm start
```

Le site public est statique (17 pages pré-rendues) ; le back-office est rendu à la
demande. Sur un hébergement Node persistant, l'ensemble fonctionne sans configuration.
Voir la contrainte d'hébergement du back-office ci-dessus avant de choisir Vercel.
