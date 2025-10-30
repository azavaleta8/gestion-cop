import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const startDateParam = searchParams.get("startDate");
  const endDateParam = searchParams.get("endDate");

  if (!startDateParam || !endDateParam) {
    return NextResponse.json(
      { error: "startDate and endDate are required" },
      { status: 400 }
    );
  }

  const startDate = new Date(startDateParam);
  const endDate = new Date(endDateParam);

  try {
    const guards = await prisma.guardDuty.findMany({
      where: {
        assignedDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        assignedStaff: {
          include: {
            rol: true,
          },
        },
        location: true,
      },
    });
    return NextResponse.json({ guards });
  } catch (error) {
    console.error("Error fetching guards:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { assignedDate, assignedStaffId, locationId, rolId, notes } = body;

    if (!assignedDate || !assignedStaffId || !locationId || !rolId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const date = new Date(assignedDate);

    // Create duty and update staff counters/last_guard in a transaction
    const [newDuty] = await prisma.$transaction([
      prisma.guardDuty.create({
        data: {
          assignedDate: date,
          assignedStaffId,
          locationId,
          rolId,
          notes,
        },
      }),
      prisma.staff.update({
        where: { id: assignedStaffId },
        data: { total_assignments: { increment: 1 } },
      }),
      // only set last_guard if it's null or earlier than this duty's date
      prisma.staff.updateMany({
        where: {
          id: assignedStaffId,
          OR: [{ last_guard: null }, { last_guard: { lt: date } }],
        },
        data: { last_guard: date },
      }),
      // location counters / last_guard
      prisma.location.update({
        where: { id: locationId },
        data: { total_assignments: { increment: 1 } },
      }),
      prisma.location.updateMany({
        where: {
          id: locationId,
          OR: [{ last_guard: null }, { last_guard: { lt: date } }],
        },
        data: { last_guard: date },
      }),
    ]);
    return NextResponse.json(newDuty, { status: 201 });
  } catch (error) {
    console.error("Error creating guard duty:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
