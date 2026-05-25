-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('DISINFECTION', 'DISINSECTION', 'DERATIZATION', 'OUTDOOR', 'CHLORINE', 'SUBSCRIPTION');

-- CreateEnum
CREATE TYPE "ObjectType" AS ENUM ('APARTMENT', 'HOUSE', 'BUSINESS', 'OTHER');

-- CreateEnum
CREATE TYPE "Source" AS ENUM ('WEBSITE', 'TELEGRAM');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'CLOSED');

-- CreateTable
CREATE TABLE "Lead" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "fullName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT,
    "service" "ServiceType",
    "objectType" "ObjectType",
    "comment" TEXT,
    "source" "Source" NOT NULL,
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "locale" VARCHAR(8),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Lead_createdAt_idx" ON "Lead"("createdAt");

-- CreateIndex
CREATE INDEX "Lead_status_idx" ON "Lead"("status");

-- CreateIndex
CREATE INDEX "Lead_phone_idx" ON "Lead"("phone");
