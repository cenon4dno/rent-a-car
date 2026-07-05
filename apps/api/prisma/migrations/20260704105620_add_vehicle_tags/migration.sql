-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
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
    "tags" TEXT NOT NULL DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Vehicle_renterId_fkey" FOREIGN KEY ("renterId") REFERENCES "RenterProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Vehicle" ("createdAt", "dailyRate", "description", "fuelType", "id", "imageUrls", "make", "mileageLimit", "model", "plateNumber", "renterId", "seatingCapacity", "status", "transmission", "updatedAt", "year") SELECT "createdAt", "dailyRate", "description", "fuelType", "id", "imageUrls", "make", "mileageLimit", "model", "plateNumber", "renterId", "seatingCapacity", "status", "transmission", "updatedAt", "year" FROM "Vehicle";
DROP TABLE "Vehicle";
ALTER TABLE "new_Vehicle" RENAME TO "Vehicle";
CREATE UNIQUE INDEX "Vehicle_plateNumber_key" ON "Vehicle"("plateNumber");
CREATE INDEX "Vehicle_renterId_idx" ON "Vehicle"("renterId");
CREATE INDEX "Vehicle_status_idx" ON "Vehicle"("status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
