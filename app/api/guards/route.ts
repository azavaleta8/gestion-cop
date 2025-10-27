import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month");
  const year = searchParams.get("year");
  const locationId = searchParams.get("locationId");

  if (!month || !year) {
    return NextResponse.json(
      { error: "Month and year are required" },
      { status: 400 }
    );
  }

  const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
  const endDate = new Date(parseInt(year), parseInt(month), 0);

  let whereClause: any = {
    assignedDate: {
      gte: startDate,
      lte: endDate,
    },
  };

  if (locationId) {
    whereClause.locationId = parseInt(locationId);
  }

  try {
    const duties = await prisma.guardDuty.findMany({
      where: whereClause,
      include: {
        assignedStaff: true,
        actualStaff: true,
        location: true,
        rol: true,
      },
      orderBy: {
        assignedDate: "asc",
      },
    });
    return NextResponse.json(duties);
  } catch (error) {
    console.error("Error fetching guard duties:", error);
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

    const newDuty = await prisma.guardDuty.create({
      data: {
        assignedDate: new Date(assignedDate),
        assignedStaffId,
        locationId,
        rolId,
        notes,
      },
    });

    return NextResponse.json(newDuty, { status: 201 });
  } catch (error) {
    console.error("Error creating guard duty:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
