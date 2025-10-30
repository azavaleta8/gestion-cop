import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
// Lightweight typing for query shapes to satisfy lint rules without depending on Prisma internals
type SortOrder = "asc" | "desc";
type OrderByInput = Array<Record<string, SortOrder>>;

type Candidate = {
  id: number;
  dni: string;
  name: string;
  total_assignments: number;
  last_guard: Date | null;
  rol: { id: number; name: string };
  month_count: number;
  last_date: string | null; // mirrors last_guard for UI compatibility
  is_free: boolean; // always true because we exclude busy
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const dateParam = url.searchParams.get("date");
  const search = (url.searchParams.get("search") || "").trim();
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const limit = parseInt(url.searchParams.get("limit") || "10", 10);
  const skip = (page - 1) * limit;
  const prioritize = (url.searchParams.get("prioritize") || "1") === "1"; // keep only this toggle

  if (!dateParam) {
    return NextResponse.json({ error: "date is required (YYYY-MM-DD)" }, { status: 400 });
  }

  // Build date objects
  const selectedDate = new Date(`${dateParam}T00:00:00Z`);
  const monthStart = new Date(Date.UTC(selectedDate.getUTCFullYear(), selectedDate.getUTCMonth(), 1));
  const monthEnd = new Date(Date.UTC(selectedDate.getUTCFullYear(), selectedDate.getUTCMonth() + 1, 1));

  // Where: exclude BUSY (any duty on selected date), apply search
  const baseWhere: Record<string, unknown> = {
    AND: [
      search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { dni: { contains: search, mode: "insensitive" } },
              { rol: { name: { contains: search, mode: "insensitive" } } },
            ],
          }
        : {},
      { assignedGuardDuties: { none: { assignedDate: selectedDate } } },
      { actualGuardDuties: { none: { assignedDate: selectedDate } } },
    ],
  };

  // Order: prioritize fairness or simple name
  const orderBy: OrderByInput = prioritize
    ? [{ last_guard: "asc" }, { total_assignments: "asc" }, { name: "asc" }]
    : [{ name: "asc" }];

  try {
    // total count for pagination
    const total = await prisma.staff.count({ where: baseWhere });

    // fetch page of candidates
    type StaffRow = {
      id: number;
      dni: string;
      name: string;
      total_assignments: number;
      last_guard: Date | null;
      rol: { id: number; name: string };
    };

    const staff: StaffRow[] = await prisma.staff.findMany({
      where: baseWhere,
  orderBy,
      skip,
      take: limit,
      select: {
        id: true,
        dni: true,
        name: true,
        total_assignments: true,
        last_guard: true,
        rol: { select: { id: true, name: true } },
      },
    });

    const ids = staff.map((s: StaffRow) => s.id);

    // Compute month_count for returned candidates using groupBy on both relations
  const monthCountMap = new Map<number, number>();
    if (ids.length > 0) {
      const assigned = await prisma.guardDuty.groupBy({
        by: ["assignedStaffId"],
        where: {
          assignedDate: { gte: monthStart, lt: monthEnd },
          assignedStaffId: { in: ids },
        },
        _count: { _all: true },
      });
      const actual = await prisma.guardDuty.groupBy({
        by: ["actualStaffId"],
        where: {
          assignedDate: { gte: monthStart, lt: monthEnd },
          actualStaffId: { in: ids },
        },
        _count: { _all: true },
      });
      for (const row of assigned) {
        monthCountMap.set(row.assignedStaffId as number, (monthCountMap.get(row.assignedStaffId as number) || 0) + row._count._all);
      }
      for (const row of actual) {
        // actualStaffId can be null in schema; groupBy doesn't return nulls
        const sid = row.actualStaffId as number;
        monthCountMap.set(sid, (monthCountMap.get(sid) || 0) + row._count._all);
      }
    }

    const candidates: Candidate[] = staff.map((s: StaffRow) => ({
      id: s.id,
      dni: s.dni,
      name: s.name,
      total_assignments: s.total_assignments ?? 0,
      last_guard: s.last_guard,
      rol: { id: s.rol.id, name: s.rol.name },
      month_count: monthCountMap.get(s.id) || 0,
      last_date: s.last_guard ? new Date(s.last_guard).toISOString() : null,
      is_free: true,
    }));

    return NextResponse.json({ candidates, total, page, limit });
  } catch (error) {
    console.error("Error fetching staff candidates (Prisma):", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
