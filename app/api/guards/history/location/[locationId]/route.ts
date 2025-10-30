import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  // derive locationId from the URL to avoid param inference issues
  const url = new URL(request.url);
  const segments = url.pathname.split("/").filter(Boolean);
  const locationIdStr = decodeURIComponent(segments[segments.length - 1] || "");
  const locationId = parseInt(locationIdStr, 10);

  if (!Number.isFinite(locationId)) {
    return NextResponse.json({ error: "Invalid location id" }, { status: 400 });
  }

  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const limit = parseInt(url.searchParams.get("limit") || "10", 10);
  const skip = (page - 1) * limit;
  const sortBy = url.searchParams.get("sortBy") || "assignedDate";
  const sortDirParam = (url.searchParams.get("sortDir") || "desc").toLowerCase();
  const sortDir = sortDirParam === "asc" ? "asc" : "desc";

  try {
    const location = await prisma.location.findUnique({ where: { id: locationId } });
    if (!location) {
      return NextResponse.json({ error: "Location not found" }, { status: 404 });
    }

    const where = { locationId };
    const total = await prisma.guardDuty.count({ where });

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
    console.error(`Error fetching guard history for location ${locationId}:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
