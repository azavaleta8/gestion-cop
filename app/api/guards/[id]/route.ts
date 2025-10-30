// app/api/guards/[id]/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { id: string };

// GET /api/guards/:id
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { id } = await params;
    const guardId = Number.parseInt(id, 10);
    if (Number.isNaN(guardId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const guard = await prisma.guardDuty.findUnique({
      where: { id: guardId },
      include: { assignedStaff: true, location: true, rol: true },
    });

    if (!guard) {
      return NextResponse.json({ error: "Guard not found" }, { status: 404 });
    }
    return NextResponse.json(guard);
  } catch (error) {
    console.error("Error fetching guard duty:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PUT /api/guards/:id
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { id } = await params;
    const guardId = Number.parseInt(id, 10);
    if (Number.isNaN(guardId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const body = await req.json();
    const { assignedDate, assignedStaffId, locationId, rolId, notes } = body ?? {};

    if (!assignedDate || !assignedStaffId || !locationId || !rolId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

  const existing = await prisma.guardDuty.findUnique({ where: { id: guardId } });
    if (!existing) {
      return NextResponse.json({ error: "Guard duty not found" }, { status: 404 });
    }

    const newDate = new Date(assignedDate);

    const locationChanged = existing.locationId !== locationId;
    if (existing.assignedStaffId !== assignedStaffId || locationChanged) {
      const updated = await prisma.$transaction(async (tx: typeof prisma) => {
        const upd = await tx.guardDuty.update({
          where: { id: guardId },
          data: {
            assignedDate: newDate,
            assignedStaffId,
            locationId,
            rolId,
            notes,
          },
        });

        // adjust counters
        await tx.staff.update({
          where: { id: existing.assignedStaffId },
          data: { total_assignments: { decrement: 1 } },
        });
        await tx.staff.update({
          where: { id: assignedStaffId },
          data: { total_assignments: { increment: 1 } },
        });
        if (locationChanged) {
          await tx.location.update({
            where: { id: existing.locationId },
            data: { total_assignments: { decrement: 1 } },
          });
          await tx.location.update({
            where: { id: locationId },
            data: { total_assignments: { increment: 1 } },
          });
        }

        // recompute last_guard for old staff
        const latestOld = await tx.guardDuty.findFirst({
          where: { assignedStaffId: existing.assignedStaffId },
          orderBy: { assignedDate: "desc" },
          select: { assignedDate: true },
        });
        await tx.staff.update({
          where: { id: existing.assignedStaffId },
          data: { last_guard: latestOld?.assignedDate ?? null },
        });

        // recompute last_guard for new staff (after update, max date should reflect newDate if it's latest)
        const latestNew = await tx.guardDuty.findFirst({
          where: { assignedStaffId },
          orderBy: { assignedDate: "desc" },
          select: { assignedDate: true },
        });
        await tx.staff.update({
          where: { id: assignedStaffId },
          data: { last_guard: latestNew?.assignedDate ?? null },
        });

        // recompute last_guard for locations
        if (locationChanged) {
          const latestOldLoc = await tx.guardDuty.findFirst({
            where: { locationId: existing.locationId },
            orderBy: { assignedDate: "desc" },
            select: { assignedDate: true },
          });
          await tx.location.update({
            where: { id: existing.locationId },
            data: { last_guard: latestOldLoc?.assignedDate ?? null },
          });

          const latestNewLoc = await tx.guardDuty.findFirst({
            where: { locationId },
            orderBy: { assignedDate: "desc" },
            select: { assignedDate: true },
          });
          await tx.location.update({
            where: { id: locationId },
            data: { last_guard: latestNewLoc?.assignedDate ?? null },
          });
        } else {
          // if only date changed, ensure location's last_guard is still correct
          const latestLoc = await tx.guardDuty.findFirst({
            where: { locationId },
            orderBy: { assignedDate: "desc" },
            select: { assignedDate: true },
          });
          await tx.location.update({
            where: { id: locationId },
            data: { last_guard: latestLoc?.assignedDate ?? null },
          });
        }

        return upd;
      });
      return NextResponse.json(updated, { status: 200 });
    }

    // Staff unchanged: update duty then recompute that staff's last_guard
  const updated = await prisma.$transaction(async (tx: typeof prisma) => {
      const upd = await tx.guardDuty.update({
        where: { id: guardId },
        data: {
          assignedDate: newDate,
          assignedStaffId,
          locationId,
          rolId,
          notes,
        },
      });

      const latest = await tx.guardDuty.findFirst({
        where: { assignedStaffId },
        orderBy: { assignedDate: "desc" },
        select: { assignedDate: true },
      });
      await tx.staff.update({
        where: { id: assignedStaffId },
        data: { last_guard: latest?.assignedDate ?? null },
      });

      const latestLoc = await tx.guardDuty.findFirst({
        where: { locationId },
        orderBy: { assignedDate: "desc" },
        select: { assignedDate: true },
      });
      await tx.location.update({
        where: { id: locationId },
        data: { last_guard: latestLoc?.assignedDate ?? null },
      });

      return upd;
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("Error updating guard duty:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE /api/guards/:id
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { id } = await params;
    const guardId = Number.parseInt(id, 10);
    if (Number.isNaN(guardId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

  const existing = await prisma.guardDuty.findUnique({ where: { id: guardId } });
    if (!existing) {
      return NextResponse.json({ error: "Guard duty not found" }, { status: 404 });
    }

  await prisma.$transaction(async (tx: typeof prisma) => {
      await tx.guardDuty.delete({ where: { id: guardId } });
      await tx.staff.update({
        where: { id: existing.assignedStaffId },
        data: { total_assignments: { decrement: 1 } },
      });
      const latest = await tx.guardDuty.findFirst({
        where: { assignedStaffId: existing.assignedStaffId },
        orderBy: { assignedDate: "desc" },
        select: { assignedDate: true },
      });
      await tx.staff.update({
        where: { id: existing.assignedStaffId },
        data: { last_guard: latest?.assignedDate ?? null },
      });

      // update location counters and last_guard
      await tx.location.update({
        where: { id: existing.locationId },
        data: { total_assignments: { decrement: 1 } },
      });
      const latestLoc = await tx.guardDuty.findFirst({
        where: { locationId: existing.locationId },
        orderBy: { assignedDate: "desc" },
        select: { assignedDate: true },
      });
      await tx.location.update({
        where: { id: existing.locationId },
        data: { last_guard: latestLoc?.assignedDate ?? null },
      });
    });
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting guard duty:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
