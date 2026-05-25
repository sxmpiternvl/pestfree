-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "claimedAt" TIMESTAMP(3),
ADD COLUMN     "claimedById" TEXT,
ADD COLUMN     "claimedByName" TEXT,
ADD COLUMN     "notifMessages" JSONB;
