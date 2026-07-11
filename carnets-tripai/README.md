# Carnets TripAI

Outil interne pour composer et partager des carnets de voyage privés.

## Stack

- **Next.js 14** (App Router)
- **Prisma** + SQLite (dev) / PostgreSQL Neon (prod)
- **Vercel Blob** pour les photos
- **Tailwind CSS**

## Développement

```bash
# Installer les dépendances
npm install

# Créer la base de données SQLite
npx prisma db push

# (Optionnel) Peupler avec le carnet d'exemple
npm run seed

# Lancer le serveur de dev
npm run dev
```

L'app tourne sur [http://localhost:3000](http://localhost:3000).

## Variables d'environnement

Créer un fichier `.env` :

```
DATABASE_URL="file:./dev.db"
ADMIN_PASSWORD="ton-mot-de-passe"
BLOB_READ_WRITE_TOKEN=""
```

- `DATABASE_URL` : en prod, remplacer par l'URL PostgreSQL Neon
- `ADMIN_PASSWORD` : mot de passe pour accéder à /admin
- `BLOB_READ_WRITE_TOKEN` : token Vercel Blob (laisser vide en dev, les uploads iront dans /public/uploads)

## Déploiement sur Vercel

1. Créer un projet sur [vercel.com](https://vercel.com) connecté au repo
2. Ajouter une base **Neon** depuis le dashboard Vercel (Storage → Neon)
3. Ajouter un **Blob Store** depuis le dashboard Vercel (Storage → Blob)
4. Configurer les variables d'environnement :
   - `DATABASE_URL` → fourni automatiquement par Neon
   - `ADMIN_PASSWORD` → ton mot de passe admin
   - `BLOB_READ_WRITE_TOKEN` → fourni automatiquement par Blob
5. Modifier `prisma/schema.prisma` : changer `provider = "sqlite"` en `provider = "postgresql"`
6. Déployer !

## Pages

| Route | Description |
|-------|-------------|
| `/` | Page vitrine |
| `/admin` | Liste des carnets (protégé par mot de passe) |
| `/admin/carnet/[id]` | Éditeur de carnet |
| `/v/[slug]` | Page publique d'un carnet (lien privé) |
