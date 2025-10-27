import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { staffDni: string } }
) {
  const { staffDni } = params;

  try {
    const staffMember = await prisma.staff.findUnique({
      where: { dni: staffDni },
    });

    if (!staffMember) {
      return NextResponse.json({ error: "Staff not found" }, { status: 404 });
    }

    const duties = await prisma.guardDuty.findMany({
      where: {
        OR: [
          { assignedStaffId: staffMember.id },
          { actualStaffId: staffMember.id },
        ],
      },
      include: {
        assignedStaff: true,
        actualStaff: true,
        location: true,
        rol: true,
      },
      orderBy: {
        assignedDate: "desc",
      },
    });

    return NextResponse.json(duties);
  } catch (error) {
    console.error(`Error fetching guard history for DNI ${staffDni}:`, error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
