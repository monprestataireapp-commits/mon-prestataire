-- AlterTable: add reply fields to Review
ALTER TABLE "Review" ADD COLUMN IF NOT EXISTS "reply" TEXT;
ALTER TABLE "Review" ADD COLUMN IF NOT EXISTS "repliedAt" TIMESTAMP(3);
