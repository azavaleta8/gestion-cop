-- Safe in-place type change for Staff.last_guard to DATE allowing NULLs
-- Convert any existing string/timestamp values to DATE when possible; keep others as NULL.
ALTER TABLE "Staff"
  ALTER COLUMN "last_guard" TYPE DATE
  USING NULLIF(CAST("last_guard" AS TEXT), '')::date;

-- Ensure column is nullable (there are staff without any guard yet)
ALTER TABLE "Staff"
  ALTER COLUMN "last_guard" DROP NOT NULL;
