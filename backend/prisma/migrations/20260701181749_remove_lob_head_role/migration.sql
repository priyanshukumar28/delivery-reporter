-- Postgres enums can't drop a value in place; recreate the type without LOB_HEAD.
-- (Caller has already ensured no User rows still reference LOB_HEAD.)
CREATE TYPE "Role_new" AS ENUM ('SUPER_ADMIN', 'ANALYST');
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'ANALYST';
DROP TYPE "Role";
ALTER TYPE "Role_new" RENAME TO "Role";
