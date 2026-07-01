-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'LOB_HEAD', 'ANALYST');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('Low', 'Medium', 'High', 'Critical');

-- CreateEnum
CREATE TYPE "DeliveryType" AS ENUM ('Feature', 'BugFix', 'Enhancement', 'Config');

-- CreateTable
CREATE TABLE "LOB" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "headName" TEXT,
    "headPhone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LOB_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'ANALYST',
    "lobId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Requirement" (
    "id" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "priority" "Priority" NOT NULL DEFAULT 'Medium',
    "module" TEXT,
    "lobId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Requirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Delivery" (
    "id" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "DeliveryType" NOT NULL DEFAULT 'Feature',
    "module" TEXT,
    "lobId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Delivery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyReport" (
    "id" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "lobId" TEXT NOT NULL,
    "imagePath" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "shareLink" TEXT NOT NULL,
    "requirements" INTEGER NOT NULL,
    "deliveries" INTEGER NOT NULL,
    "modules" INTEGER NOT NULL,
    "bugFixes" INTEGER NOT NULL,
    "features" INTEGER NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LOB_name_key" ON "LOB"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Requirement_lobId_date_idx" ON "Requirement"("lobId", "date");

-- CreateIndex
CREATE INDEX "Delivery_lobId_date_idx" ON "Delivery"("lobId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "DailyReport_lobId_date_key" ON "DailyReport"("lobId", "date");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_lobId_fkey" FOREIGN KEY ("lobId") REFERENCES "LOB"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Requirement" ADD CONSTRAINT "Requirement_lobId_fkey" FOREIGN KEY ("lobId") REFERENCES "LOB"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Requirement" ADD CONSTRAINT "Requirement_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Delivery" ADD CONSTRAINT "Delivery_lobId_fkey" FOREIGN KEY ("lobId") REFERENCES "LOB"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Delivery" ADD CONSTRAINT "Delivery_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyReport" ADD CONSTRAINT "DailyReport_lobId_fkey" FOREIGN KEY ("lobId") REFERENCES "LOB"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
