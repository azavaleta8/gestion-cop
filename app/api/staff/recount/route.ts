import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/staff/recount
export async function POST() {
  try {
    // Count assignments per staff
    const counts = await prisma.guardDuty.groupBy({
      by: ["assignedStaffId"],
      _count: { assignedStaffId: true },
    });

    // Compute last_guard (max assignedDate per staff)
    const lastGuards = await prisma.guardDuty.groupBy({
      by: ["assignedStaffId"],
      _max: { assignedDate: true },
    });

    // Reset all to 0, then apply counts
    await prisma.$transaction([
      prisma.staff.updateMany({ data: { total_assignments: 0, last_guard: null } }),
      ...counts.map((c: { assignedStaffId: number; _count: { assignedStaffId: number } }) =>
        prisma.staff.update({
          where: { id: c.assignedStaffId },
          data: { total_assignments: c._count.assignedStaffId },
        })
      ),
      ...lastGuards.map((g: { assignedStaffId: number; _max: { assignedDate: Date | null } }) =>
        prisma.staff.update({
          where: { id: g.assignedStaffId },
          data: { last_guard: g._max.assignedDate },
        })
      ),
    ]);

  return NextResponse.json({ ok: true, updated: counts.length });
  } catch (error) {
    console.error("Error recounting staff assignments:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
