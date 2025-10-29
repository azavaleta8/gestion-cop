/*
  Warnings:

  - You are about to drop the column `total_hours` on the `Staff` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Staff" DROP COLUMN "total_hours",
ADD COLUMN     "total_assignments" INTEGER NOT NULL DEFAULT 0;
