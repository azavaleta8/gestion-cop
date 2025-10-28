import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
    const body = await request.json();
    const { assignedDate, assignedStaffId, locationId, rolId, notes } = body;

    if (!assignedDate || !assignedStaffId || !locationId || !rolId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const updatedDuty = await prisma.guardDuty.update({
      where: { id },
      data: {
        assignedDate: new Date(assignedDate),
        assignedStaffId,
        locationId,
        rolId,
        notes,
      },
    });

    return NextResponse.json(updatedDuty, { status: 200 });
  } catch (error) {
    console.error(`Error updating guard duty with id ${params.id}:`, error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);

    await prisma.guardDuty.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 }); // No Content
  } catch (error) {
    console.error(`Error deleting guard duty with id ${params.id}:`, error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
