-- Requirement: rename title -> description, add requestedBy
ALTER TABLE "Requirement" ADD COLUMN "requestedBy" TEXT;
UPDATE "Requirement" SET "description" = "title" WHERE "description" IS NULL;
ALTER TABLE "Requirement" ALTER COLUMN "description" SET NOT NULL;
ALTER TABLE "Requirement" DROP COLUMN "title";

-- Delivery: rename title -> description, add remarks, convert type enum -> text
ALTER TABLE "Delivery" ADD COLUMN "remarks" TEXT;
UPDATE "Delivery" SET "description" = "title" WHERE "description" IS NULL;
ALTER TABLE "Delivery" ALTER COLUMN "description" SET NOT NULL;
ALTER TABLE "Delivery" DROP COLUMN "title";
ALTER TABLE "Delivery" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "Delivery" ALTER COLUMN "type" TYPE TEXT USING "type"::TEXT;
ALTER TABLE "Delivery" ALTER COLUMN "type" SET DEFAULT 'Feature';
DROP TYPE "DeliveryType";
