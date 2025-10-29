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

    const updated = await prisma.guardDuty.update({
      where: { id: guardId },
      data: {
        assignedDate: new Date(assignedDate),
        assignedStaffId,
        locationId,
        rolId,
        notes,
      },
      // include: { assignedStaff: true, location: true, rol: true }, // if you want relations back
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

    await prisma.guardDuty.delete({ where: { id: guardId } });
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting guard duty:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
