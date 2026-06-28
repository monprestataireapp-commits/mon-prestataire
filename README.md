# MonPrestataire

**Le premier moteur de recherche des prestataires indépendants.**

Marketplace de mise en relation entre prestataires indépendants et clients en France.

---

## Stack technique

- **Next.js 14** (App Router)
- **Tailwind CSS** (design premium rose/doré)
- **Prisma + SQLite** (base de données locale)
- **NextAuth** (authentification)
- **Stripe** (abonnements)
- **Hébergement Vercel**

---

## Lancer le projet en local

### 1. Prérequis

- Node.js v18 ou supérieur
- npm v9 ou supérieur

### 2. Installation

```bash
npm install
```

### 3. Variables d'environnement

Copiez `.env.example` en `.env` et remplissez les valeurs :

```bash
cp .env.example .env
```

Variables obligatoires pour démarrer :
- `DATABASE_URL` — déjà configuré avec SQLite (`file:./dev.db`)
- `NEXTAUTH_SECRET` — générez avec : `openssl rand -base64 32`
- `NEXTAUTH_URL` — `http://localhost:3000` en local

Variables Stripe (mode test) :
- `STRIPE_PUBLIC_KEY` — depuis dashboard.stripe.com
- `STRIPE_SECRET_KEY` — depuis dashboard.stripe.com
- `STRIPE_WEBHOOK_SECRET` — depuis la CLI Stripe

### 4. Base de données

```bash
# Créer la base de données
npm run db:migrate

# Peupler avec les données de démonstration
npm run db:seed
```

### 5. Démarrer le serveur de développement

```bash
npm run dev
```

Le site est disponible sur [http://localhost:3000](http://localhost:3000)

---

## Comptes de démonstration (après le seed)

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Admin | admin@monprestataire.fr | admin1234 |
| Prestataire | sophia@demo.fr | demo1234 |
| Prestataire | amira@demo.fr | demo1234 |
| Prestataire | nassim@demo.fr | demo1234 |

---

## Configuration Stripe

### Créer les prix dans Stripe

Dans le dashboard Stripe (mode test), créez 4 produits/prix :

| Plan | Prix | Intervalle | Variable .env |
|------|------|-----------|---------------|
| Standard Mensuel | 4,99€ | month | `STRIPE_STANDARD_MONTHLY_PRICE_ID` |
| Standard Annuel | 49,90€ | year | `STRIPE_STANDARD_YEARLY_PRICE_ID` |
| Premium Mensuel | 9,99€ | month | `STRIPE_PREMIUM_MONTHLY_PRICE_ID` |
| Premium Annuel | 99,90€ | year | `STRIPE_PREMIUM_YEARLY_PRICE_ID` |

### Créer le coupon d'offre lancement

Dans Stripe > Coupons, créez :
- Code : `LANCEMENT6MOIS`
- Type : Durée → 6 mois
- Remise : 100%

### Webhook Stripe en local

```bash
# Installer la CLI Stripe
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copiez le `whsec_...` dans `STRIPE_WEBHOOK_SECRET`.

---

## Déployer sur Vercel

### 1. Préparer le dépôt Git

```bash
git init
git add .
git commit -m "Initial commit — MonPrestataire"
```

Créez un dépôt sur GitHub et poussez-y le code.

### 2. Déployer sur Vercel

1. Connectez-vous sur [vercel.com](https://vercel.com)
2. Importez votre dépôt GitHub
3. Ajoutez toutes les variables d'environnement du `.env`
4. Changez `NEXTAUTH_URL` par votre URL Vercel (ex: `https://monprestataire.vercel.app`)
5. Cliquez **Deploy**

### 3. Base de données en production

SQLite ne fonctionne pas sur Vercel (système de fichiers éphémère). Pour la production :

**Option recommandée : PlanetScale ou Turso**

1. Créez un compte sur [turso.tech](https://turso.tech) (gratuit)
2. Créez une base de données
3. Remplacez dans `prisma/schema.prisma` :
   ```prisma
   datasource db {
     provider = "sqlite"  // → "turso" ou migrez vers PostgreSQL
     url      = env("DATABASE_URL")
   }
   ```
4. Ou utilisez [Neon](https://neon.tech) (PostgreSQL serverless gratuit)

**Changement minimal pour PostgreSQL :**
- Remplacez `provider = "sqlite"` par `provider = "postgresql"` dans le schema
- Mettez à jour `DATABASE_URL` avec l'URL PostgreSQL

### 4. Webhook Stripe en production

Dans le dashboard Stripe :
- Ajoutez un endpoint : `https://votre-domaine.vercel.app/api/stripe/webhook`
- Sélectionnez les événements :
  - `checkout.session.completed`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
- Copiez le `whsec_...` dans les variables d'environnement Vercel

---

## Pages disponibles

| URL | Description |
|-----|-------------|
| `/` | Page d'accueil avec recherche IA |
| `/recherche` | Recherche avec filtres avancés (budget, disponibilité, livraison) |
| `/categorie/[slug]` | Page dédiée par catégorie (21 catégories) |
| `/prestataire/[slug]` | Profil détaillé d'un prestataire (lightbox galerie, partage) |
| `/inscription` | Inscription prestataire (5 étapes : compte, profil, localisation, livraison, tarifs + catégories) |
| `/abonnement` | Choix de la formule (Stripe Checkout) |
| `/abonnement/succes` | Confirmation après paiement |
| `/abonnement/annulation` | Retour en cas d'annulation |
| `/connexion` | Connexion |
| `/dashboard` | Tableau de bord prestataire (stats, photos, portal Stripe) |
| `/dashboard/modifier` | Modifier son profil (photos de profil et couverture, tarifs, réseaux) |
| `/demandes` | Demandes clients publiques (réponse par les prestataires) |
| `/mes-demandes` | Mes demandes + réponses reçues (clients) |
| `/favoris` | Favoris du client |
| `/admin` | Administration : valider prestataires, modérer avis |
| `/comment-ca-marche` | Guide client et prestataire |
| `/contact` | Contact et support |
| `/cgu` | Conditions Générales d'Utilisation |
| `/confidentialite` | Politique de confidentialité |
| `/mentions-legales` | Mentions légales |
| `/sitemap.xml` | Sitemap dynamique (SEO) |
| `/robots.txt` | Instructions robots (SEO) |

---

## Catégories

21 catégories au lancement : Maquillage & Beauté, Coiffure & Onglerie, Esthétique & Bien-être, Gâteaux & Sucreries, Photographie, Vidéaste, Décoration & Events, DJ & Animation, Bijoux & Accessoires, Mode & Couture, Automobile, Mariage, Artisans Fait Main, Traiteur & Cuisine, Services Communautaires Islam, Cadeaux Personnalisés, Bougies & Parfums, Créateurs de contenu, Personnalisation Textile & Impression, Voyages & Aventures, Autres.

---

## Architecture multi-pays

La base de données inclut un champ `country` (FR/BE/CH) sur les profils prestataires pour une extension future vers la Belgique et la Suisse.

---

## Scripts disponibles

```bash
npm run dev          # Serveur de développement
npm run build        # Build de production
npm run start        # Démarrer en production
npm run db:migrate   # Appliquer les migrations Prisma
npm run db:studio    # Ouvrir Prisma Studio
npm run db:seed      # Peupler la base avec les données de démo
```
