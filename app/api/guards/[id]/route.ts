import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const dutyId = parseInt(id);

  try {
    const body = await request.json();
    const { actualStaffId, notes } = body;

    if (!actualStaffId) {
      return NextResponse.json(
        { error: "actualStaffId is required" },
        { status: 400 }
      );
    }

    const updatedDuty = await prisma.guardDuty.update({
      where: { id: dutyId },
      data: {
        actualStaffId,
        notes,
      },
    });

    return NextResponse.json(updatedDuty);
  } catch (error) {
    console.error(`Error updating guard duty ${id}:`, error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
