/*
  Warnings:

  - Added the required column `last_guard` to the `Staff` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Location" ADD COLUMN     "image" TEXT;

-- AlterTable
ALTER TABLE "public"."Staff" ADD COLUMN     "day" TEXT,
ADD COLUMN     "last_guard" INTEGER NOT NULL,
ADD COLUMN     "locationId" INTEGER;

-- AddForeignKey
ALTER TABLE "public"."Staff" ADD CONSTRAINT "Staff_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "public"."Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;
