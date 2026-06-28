#!/bin/bash
# Prépare le projet pour le déploiement en production (PostgreSQL)
# Usage : bash scripts/prepare-deploy.sh

set -e
echo "🚀 Préparation du déploiement production..."

# 1. Basculer schema.prisma vers PostgreSQL
sed -i 's/\/\/ Dev local: sqlite \/ Production: changer en "postgresql"\n//' prisma/schema.prisma
sed -i 's/provider = "sqlite"/provider = "postgresql"/' prisma/schema.prisma
echo "✅ schema.prisma → postgresql"

# 2. Ajouter mode: 'insensitive' dans les requêtes contains
sed -i "s/contains: intent\.city }/contains: intent.city, mode: 'insensitive' }/" src/app/api/search/route.ts
sed -i "s/contains: intent\.name }/contains: intent.name, mode: 'insensitive' }/" src/app/api/search/route.ts
sed -i "s/contains: intent\.category }/contains: intent.category, mode: 'insensitive' }/" src/app/api/search/route.ts
sed -i "s/contains: q }/contains: q, mode: 'insensitive' }/" src/app/api/providers/route.ts
echo "✅ mode: 'insensitive' ajouté aux requêtes"

# 3. Régénérer le client Prisma
npx prisma generate
echo "✅ Prisma client régénéré"

echo ""
echo "📋 Étapes suivantes :"
echo "   1. Vérifier que DATABASE_URL dans .env pointe vers Neon"
echo "   2. npx prisma migrate deploy"
echo "   3. npm run stripe:setup"
echo "   4. vercel --prod"
echo ""
echo "⚠️  Pour revenir en dev local : bash scripts/restore-dev.sh"
