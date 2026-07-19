-- AlterTable
ALTER TABLE "DailyReport" ADD COLUMN     "delayFlags" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "pdfPath" TEXT,
ADD COLUMN     "pdfUrl" TEXT;

-- CreateTable
CREATE TABLE "DelayUpdate" (
    "id" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "module" TEXT,
    "deliverable" TEXT NOT NULL,
    "originalDueDate" TEXT,
    "revisedDueDate" TEXT,
    "status" TEXT NOT NULL DEFAULT 'WIP',
    "reason" TEXT,
    "lobId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DelayUpdate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DelayUpdate_lobId_date_idx" ON "DelayUpdate"("lobId", "date");

-- AddForeignKey
ALTER TABLE "DelayUpdate" ADD CONSTRAINT "DelayUpdate_lobId_fkey" FOREIGN KEY ("lobId") REFERENCES "LOB"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DelayUpdate" ADD CONSTRAINT "DelayUpdate_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
