-- AlterTable: add verification request fields to Provider
ALTER TABLE "Provider" ADD COLUMN IF NOT EXISTS "verificationRequested" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Provider" ADD COLUMN IF NOT EXISTS "verificationRequestedAt" TIMESTAMP(3);
