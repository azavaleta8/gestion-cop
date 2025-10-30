import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Recompute total_assignments and last_guard for all locations
export async function POST() {
  try {
    const locations = await prisma.location.findMany({ select: { id: true } });

    await prisma.$transaction(async (tx) => {
      for (const loc of locations) {
        const [count, latest] = await Promise.all([
          tx.guardDuty.count({ where: { locationId: loc.id } }),
          tx.guardDuty.findFirst({
            where: { locationId: loc.id },
            orderBy: { assignedDate: "desc" },
            select: { assignedDate: true },
          }),
        ]);

        await tx.location.update({
          where: { id: loc.id },
          data: {
            total_assignments: count,
            last_guard: latest?.assignedDate ?? null,
          },
        });
      }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error recounting locations:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
