-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_RenterProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "businessPermitUrl" TEXT,
    "companyRegUrl" TEXT,
    "taxIdNumber" TEXT,
    "bankAccountDetails" TEXT,
    "trustBadge" TEXT NOT NULL DEFAULT 'NOT_VERIFIED',
    "commissionRate" REAL NOT NULL DEFAULT 0.05,
    "penaltyFlags" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RenterProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_RenterProfile" ("bankAccountDetails", "businessPermitUrl", "commissionRate", "companyName", "companyRegUrl", "createdAt", "id", "taxIdNumber", "trustBadge", "updatedAt", "userId") SELECT "bankAccountDetails", "businessPermitUrl", "commissionRate", "companyName", "companyRegUrl", "createdAt", "id", "taxIdNumber", "trustBadge", "updatedAt", "userId" FROM "RenterProfile";
DROP TABLE "RenterProfile";
ALTER TABLE "new_RenterProfile" RENAME TO "RenterProfile";
CREATE UNIQUE INDEX "RenterProfile_userId_key" ON "RenterProfile"("userId");
CREATE TABLE "new_Vehicle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "renterId" TEXT NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "plateNumber" TEXT NOT NULL,
    "description" TEXT,
    "fuelType" TEXT NOT NULL,
    "transmission" TEXT NOT NULL,
    "seatingCapacity" INTEGER NOT NULL,
    "dailyRate" REAL NOT NULL,
    "mileageLimit" INTEGER,
    "imageUrls" TEXT NOT NULL DEFAULT '[]',
    "vehiclePhotos" TEXT NOT NULL DEFAULT '{}',
    "registrationDocs" TEXT NOT NULL DEFAULT '{}',
    "tags" TEXT NOT NULL DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Vehicle_renterId_fkey" FOREIGN KEY ("renterId") REFERENCES "RenterProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Vehicle" ("createdAt", "dailyRate", "description", "fuelType", "id", "imageUrls", "make", "mileageLimit", "model", "plateNumber", "renterId", "seatingCapacity", "status", "tags", "transmission", "updatedAt", "year") SELECT "createdAt", "dailyRate", "description", "fuelType", "id", "imageUrls", "make", "mileageLimit", "model", "plateNumber", "renterId", "seatingCapacity", "status", "tags", "transmission", "updatedAt", "year" FROM "Vehicle";
DROP TABLE "Vehicle";
ALTER TABLE "new_Vehicle" RENAME TO "Vehicle";
CREATE UNIQUE INDEX "Vehicle_plateNumber_key" ON "Vehicle"("plateNumber");
CREATE INDEX "Vehicle_renterId_idx" ON "Vehicle"("renterId");
CREATE INDEX "Vehicle_status_idx" ON "Vehicle"("status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
