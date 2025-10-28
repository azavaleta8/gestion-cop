-- CreateTable
CREATE TABLE "public"."User" (
    "id" SERIAL NOT NULL,
    "dni" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Rol" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Rol_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Staff" (
    "id" SERIAL NOT NULL,
    "dni" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "day" TEXT,
    "last_guard" TEXT,
    "total_hours" INTEGER NOT NULL DEFAULT 0,
    "image" TEXT,
    "rolId" INTEGER NOT NULL,
    "locationId" INTEGER,

    CONSTRAINT "Staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Location" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."GuardDuty" (
    "id" SERIAL NOT NULL,
    "assignedDate" TIMESTAMP(3) NOT NULL,
    "assignedStaffId" INTEGER NOT NULL,
    "actualStaffId" INTEGER,
    "locationId" INTEGER NOT NULL,
    "rolId" INTEGER NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GuardDuty_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_dni_key" ON "public"."User"("dni");

-- CreateIndex
CREATE UNIQUE INDEX "Rol_name_key" ON "public"."Rol"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Staff_dni_key" ON "public"."Staff"("dni");

-- CreateIndex
CREATE UNIQUE INDEX "Location_name_key" ON "public"."Location"("name");

-- AddForeignKey
ALTER TABLE "public"."Staff" ADD CONSTRAINT "Staff_rolId_fkey" FOREIGN KEY ("rolId") REFERENCES "public"."Rol"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Staff" ADD CONSTRAINT "Staff_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "public"."Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GuardDuty" ADD CONSTRAINT "GuardDuty_assignedStaffId_fkey" FOREIGN KEY ("assignedStaffId") REFERENCES "public"."Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GuardDuty" ADD CONSTRAINT "GuardDuty_actualStaffId_fkey" FOREIGN KEY ("actualStaffId") REFERENCES "public"."Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GuardDuty" ADD CONSTRAINT "GuardDuty_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "public"."Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GuardDuty" ADD CONSTRAINT "GuardDuty_rolId_fkey" FOREIGN KEY ("rolId") REFERENCES "public"."Rol"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
