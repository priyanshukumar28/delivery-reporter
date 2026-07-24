/*
  Warnings:

  - You are about to drop the column `type` on the `Delivery` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "DelayUpdate" ADD COLUMN     "approvalTaken" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "approvedBy" TEXT,
ADD COLUMN     "approvedDate" TEXT,
ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'Development',
ADD COLUMN     "receivedDate" TEXT,
ADD COLUMN     "receivedFrom" TEXT;

-- AlterTable
ALTER TABLE "Delivery" DROP COLUMN "type",
ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'Development',
ADD COLUMN     "closedDate" TEXT,
ADD COLUMN     "receivedDate" TEXT,
ADD COLUMN     "receivedFrom" TEXT;

-- AlterTable
ALTER TABLE "Requirement" ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'Development',
ADD COLUMN     "receivedDate" TEXT,
ADD COLUMN     "receivedFrom" TEXT;
