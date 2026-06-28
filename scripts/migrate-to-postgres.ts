/**
 * Migration SQLite → PostgreSQL pour la mise en production.
 *
 * Usage :
 *   1. Renseigner SQLITE_URL et POSTGRES_URL dans le .env
 *   2. npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/migrate-to-postgres.ts
 *
 * Ce script exporte les données SQLite et les importe dans PostgreSQL.
 * Assurez-vous que le schéma PostgreSQL est déjà créé (prisma migrate deploy).
 */

import { PrismaClient as SQLiteClient } from '@prisma/client'

// Instancier avec les deux URL explicitement
const sqlite = new SQLiteClient({ datasources: { db: { url: process.env.SQLITE_URL || 'file:./prisma/dev.db' } } })

// Pour Postgres : passer temporairement l'URL dans l'env avant d'instancier
const originalUrl = process.env.DATABASE_URL
process.env.DATABASE_URL = process.env.POSTGRES_URL || originalUrl!
const { PrismaClient: PGClient } = require('@prisma/client')
const pg = new PGClient()
process.env.DATABASE_URL = originalUrl

async function migrate() {
  console.log('🚀 Migration SQLite → PostgreSQL...\n')
  await sqlite.$connect()
  await pg.$connect()

  // Ordre important : respecter les FK
  const tables = ['user', 'account', 'session', 'category', 'provider', 'providerCategory',
    'providerPhoto', 'providerVideo', 'review', 'favorite', 'clientRequest',
    'devisRequest', 'newsletterSubscriber', 'siteConfig']

  for (const table of tables) {
    try {
      const rows = await (sqlite as any)[table].findMany()
      if (rows.length === 0) { console.log(`  ⏭  ${table} — vide`); continue }
      await (pg as any)[table].createMany({ data: rows, skipDuplicates: true })
      console.log(`  ✅ ${table} — ${rows.length} lignes`)
    } catch (e: any) {
      console.warn(`  ⚠️  ${table} — ${e.message}`)
    }
  }

  await sqlite.$disconnect()
  await pg.$disconnect()
  console.log('\n✅ Migration terminée !')
  console.log('→ N\'oubliez pas de changer prisma/schema.prisma : provider = "postgresql"')
  console.log('→ Puis : npx prisma migrate deploy')
  console.log('→ Et ajouter mode: "insensitive" dans les requêtes contains\n')
}

migrate().catch(e => { console.error('❌', e); process.exit(1) })
