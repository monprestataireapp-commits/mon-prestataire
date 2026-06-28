# Guide de déploiement — MonPrestataire

## 1. Base de données PostgreSQL (Neon)

1. Créer un compte sur **https://neon.tech** (gratuit)
2. New Project → choisir région **EU Central (Frankfurt)**
3. Copier la **Connection String** (format `postgresql://...?sslmode=require`)
4. La coller comme `DATABASE_URL` dans les variables Vercel

```bash
# Générer le schéma en production (à faire UNE FOIS après le premier déploiement)
npx prisma migrate deploy

# Ou si c'est la première fois, créer la migration initiale en local avec la DB Neon :
DATABASE_URL="postgresql://..." npx prisma migrate dev --name init
```

---

## 2. Vercel Blob — Stockage des photos et vidéos

Les photos et vidéos sont stockées dans **Vercel Blob** (pas sur le filesystem local qui est éphémère sur Vercel).

1. **Vercel Dashboard → Storage → Create Store → Blob**
2. Nommer le store `monprestataire-media`
3. Copier le **`BLOB_READ_WRITE_TOKEN`** → le coller dans les variables d'environnement Vercel
4. Le SDK `@vercel/blob` est déjà installé — aucune autre configuration requise

> En développement local, les uploads vers Vercel Blob nécessitent aussi le token dans `.env`.  
> Alternative dev : créer un store de dev séparé sur Vercel.

---

## 4. Stripe — Configuration production

### Produits et prix à créer

Dans **https://dashboard.stripe.com/products** → Add product :

| Produit | Prix | Intervalle | ID à copier |
|---|---|---|---|
| MonPrestataire Standard | 4,99 € | Mensuel | `STRIPE_STANDARD_MONTHLY_PRICE_ID` |
| MonPrestataire Standard | 49,90 € | Annuel | `STRIPE_STANDARD_YEARLY_PRICE_ID` |
| MonPrestataire Premium | 9,99 € | Mensuel | `STRIPE_PREMIUM_MONTHLY_PRICE_ID` |
| MonPrestataire Premium | 99,90 € | Annuel | `STRIPE_PREMIUM_YEARLY_PRICE_ID` |

### Webhook Stripe

1. **Stripe Dashboard → Webhooks → Add endpoint**
2. URL : `https://monprestataire.fr/api/stripe/webhook`
3. Événements à écouter :
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
4. Copier le **Signing secret** → `STRIPE_WEBHOOK_SECRET`

### Coupon 6 mois offerts (membres fondateurs)

1. **Stripe Dashboard → Coupons → Create**
2. Type : `Percentage off` → `100%`
3. Duration : `3 months` (ou 6 si disponible, sinon créer 2 coupons de 3 mois)
4. Max redemptions : `100`
5. Copier l'ID du coupon et l'utiliser dans `/api/stripe/create-checkout`

---

## 5. Resend — Emails transactionnels

1. Créer un compte sur **https://resend.com** (gratuit jusqu'à 3 000 emails/mois)
2. **Domains → Add Domain** → ajouter `monprestataire.fr`
3. Ajouter les enregistrements DNS (SPF, DKIM, DMARC) chez votre registrar
4. **API Keys → Create API Key** → copier → `RESEND_API_KEY`
5. Mettre `EMAIL_FROM="MonPrestataire <noreply@monprestataire.fr>"`

---

## 6. Vercel — Déploiement

### Variables d'environnement à ajouter

Dans **Vercel Dashboard → Settings → Environment Variables** :

```
DATABASE_URL              postgresql://...?sslmode=require
BLOB_READ_WRITE_TOKEN     vercel_blob_rw_...
NEXTAUTH_URL          https://monprestataire.fr
NEXTAUTH_SECRET       [générer : openssl rand -base64 32]
STRIPE_PUBLIC_KEY     pk_live_...
STRIPE_SECRET_KEY     sk_live_...
STRIPE_WEBHOOK_SECRET whsec_...
STRIPE_STANDARD_MONTHLY_PRICE_ID   price_...
STRIPE_STANDARD_YEARLY_PRICE_ID    price_...
STRIPE_PREMIUM_MONTHLY_PRICE_ID    price_...
STRIPE_PREMIUM_YEARLY_PRICE_ID     price_...
RESEND_API_KEY        re_...
EMAIL_FROM            MonPrestataire <noreply@monprestataire.fr>
CRON_SECRET           [générer : openssl rand -base64 32]
ADMIN_EMAIL           admin@monprestataire.fr
```

### Déploiement

```bash
# Installer Vercel CLI
npm i -g vercel

# Premier déploiement
vercel

# Lier au domaine
vercel domains add monprestataire.fr
```

Ou simplement pousser sur GitHub et connecter le repo dans le dashboard Vercel.

---

## 7. Après le premier déploiement

```bash
# Appliquer les migrations sur la DB de production
npx prisma migrate deploy

# Seeder les catégories et comptes de démo
NODE_ENV=production DATABASE_URL="postgresql://..." npx tsx src/lib/seed.ts
```

### Vérifications post-déploiement

- [ ] `https://monprestataire.fr` charge correctement
- [ ] Inscription prestataire → email de bienvenue reçu
- [ ] Paiement Stripe test → abonnement activé
- [ ] Webhook Stripe reçu (voir logs dans Stripe Dashboard)
- [ ] `/sitemap.xml` accessible
- [ ] `/robots.txt` accessible
- [ ] Google Search Console → soumettre le sitemap

---

## 6. DNS (si domaine chez OVH/Gandi/etc.)

Ajouter ces entrées chez votre registrar :

```
Type  Nom   Valeur
A     @     76.76.21.21        (IP Vercel)
CNAME www   cname.vercel-dns.com
```

Pour les emails Resend, ajouter les enregistrements fournis par Resend (SPF + DKIM).

---

## 7. Cron Vercel

Le fichier `vercel.json` configure automatiquement le reset quotidien de disponibilité.
Vérifier dans **Vercel Dashboard → Settings → Cron Jobs** qu'il apparaît bien.

Le cron appelle `GET /api/cron/reset-availability` avec le header `Authorization: Bearer {CRON_SECRET}`.

---

## 8. Passage SQLite → PostgreSQL en local (optionnel)

Si vous voulez tester PostgreSQL en local avec Docker :

```bash
docker run --name monpresta-pg -e POSTGRES_PASSWORD=password -e POSTGRES_DB=monprestataire -p 5432:5432 -d postgres:16

# Puis dans .env :
DATABASE_URL="postgresql://postgres:password@localhost:5432/monprestataire"

npx prisma migrate dev --name init
npx tsx src/lib/seed.ts
```
