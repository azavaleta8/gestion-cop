-- AlterTable
ALTER TABLE "Location" ADD COLUMN     "last_guard" DATE,
ADD COLUMN     "total_assignments" INTEGER NOT NULL DEFAULT 0;
