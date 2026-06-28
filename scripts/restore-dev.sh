#!/bin/bash
# Restaure le projet pour le développement local (SQLite)
# Usage : bash scripts/restore-dev.sh

set -e
echo "🔄 Restauration configuration dev local..."

# 1. Revenir à SQLite
sed -i 's/provider = "postgresql"/provider = "sqlite"/' prisma/schema.prisma
echo "✅ schema.prisma → sqlite"

# 2. Retirer mode: 'insensitive'
sed -i "s/, mode: 'insensitive'//g" src/app/api/search/route.ts
sed -i "s/, mode: 'insensitive'//g" src/app/api/providers/route.ts
echo "✅ mode: 'insensitive' retiré"

# 3. Régénérer le client
npx prisma generate
echo "✅ Prisma client régénéré"

echo "✅ Prêt pour le dev local (npm run dev)"
