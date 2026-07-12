-- Sync drift: these objects were added to schema.prisma without a migration
-- (applied locally via `prisma db push`). Generated with `prisma migrate diff
-- --from-migrations --to-schema-datamodel`.

-- AlterTable
ALTER TABLE "CustomerProfile" ADD COLUMN "licenseBackUrl" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN "phone" TEXT;

-- AlterTable
ALTER TABLE "Vehicle" ADD COLUMN "operatingLocation" TEXT;

-- CreateTable
CREATE TABLE "LegalPage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'Feedback',
    "message" TEXT NOT NULL,
    "attachmentUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "adminReply" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "HomepageConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slides" TEXT NOT NULL DEFAULT '[]',
    "featuredMode" TEXT NOT NULL DEFAULT 'AUTO',
    "featuredIds" TEXT NOT NULL DEFAULT '[]',
    "updatedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "LegalPage_slug_key" ON "LegalPage"("slug");
