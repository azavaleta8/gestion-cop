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
    const startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
    const endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);

    const existingDuty = await prisma.guardDuty.findFirst({
        where: {
            assignedDate: {
                gte: startDate,
                lte: endDate,
            }
        }
    });

    if (existingDuty) {
        // If duty exists, update it
        const updatedDuty = await prisma.guardDuty.update({
            where: { id: existingDuty.id },
            data: {
                assignedStaffId,
                locationId,
                rolId,
                notes,
            },
        });
        return NextResponse.json(updatedDuty, { status: 200 });
    } else {
        // If no duty exists, create a new one
        const newDuty = await prisma.guardDuty.create({
            data: {
                assignedDate: date,
                assignedStaffId,
                locationId,
                rolId,
                notes,
            },
        });
        return NextResponse.json(newDuty, { status: 201 });
    }
  } catch (error) {
    console.error("Error creating or updating guard duty:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
