import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  // Derive staffDni from the URL to avoid Next.js param type inference issues
  const url = new URL(request.url);
  const segments = url.pathname.split("/").filter(Boolean);
  const staffDni = decodeURIComponent(segments[segments.length - 1] || "");

  // pagination and sorting params
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const limit = parseInt(url.searchParams.get("limit") || "10", 10);
  const skip = (page - 1) * limit;
  const sortBy = url.searchParams.get("sortBy") || "assignedDate";
  const sortDirParam = (url.searchParams.get("sortDir") || "desc").toLowerCase();
  const sortDir = sortDirParam === "asc" ? "asc" : "desc";

  try {
    const staffMember = await prisma.staff.findUnique({
      where: { dni: staffDni },
    });

    if (!staffMember) {
      return NextResponse.json({ error: "Staff not found" }, { status: 404 });
    }

    const where = {
      OR: [
        { assignedStaffId: staffMember.id },
        { actualStaffId: staffMember.id },
      ],
    };

    const total = await prisma.guardDuty.count({ where });

    // map sortBy to allowed fields
    const allowedSort = new Set(["assignedDate", "createdAt"]);
    const sortField = allowedSort.has(sortBy) ? sortBy : "assignedDate";

    const duties = await prisma.guardDuty.findMany({
      where,
      include: {
        assignedStaff: true,
        actualStaff: true,
        location: true,
        rol: true,
      },
      orderBy: { [sortField]: sortDir },
      skip,
      take: limit,
    });

    return NextResponse.json({ duties, total, page, limit, sortBy: sortField, sortDir });
  } catch (error) {
    console.error(`Error fetching guard history for DNI ${staffDni}:`, error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
