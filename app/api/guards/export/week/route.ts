import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import ExcelJS from "exceljs";

export const dynamic = "force-dynamic";

function getWeekDates(start: Date) {
  const dates: Date[] = [];
  const s = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()));
  for (let i = 0; i < 7; i++) {
    const d = new Date(s);
    d.setUTCDate(s.getUTCDate() + i);
    dates.push(d);
  }
  return dates;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const startParam = url.searchParams.get("start"); // YYYY-MM-DD
  if (!startParam) {
    return NextResponse.json({ error: "start is required (YYYY-MM-DD)" }, { status: 400 });
  }

  const start = new Date(`${startParam}T00:00:00Z`);
  const dates = getWeekDates(start);
  const end = new Date(dates[6]);
  end.setUTCHours(23, 59, 59, 999);

  // Fetch guards for the week with staff, role, location
  const guards = await prisma.guardDuty.findMany({
    where: { assignedDate: { gte: start, lte: end } },
    include: {
      assignedStaff: { select: { id: true, name: true, phone: true, rol: { select: { name: true } } } },
      location: { select: { name: true } },
    },
    orderBy: [{ assignedDate: "asc" }],
  });

  // Group by staff
  const byStaff = new Map<number, {
    name: string;
    phone: string | null;
    rank: string; // rol name
    service: string | null; // first location in week
    marks: Record<string, boolean>;
  }>();

  const dateKeys = dates.map(d => d.toISOString().slice(0,10));

  for (const g of guards) {
    const sid = g.assignedStaffId;
    if (!byStaff.has(sid)) {
      byStaff.set(sid, {
        name: g.assignedStaff?.name || "",
        phone: g.assignedStaff?.phone || null,
        rank: g.assignedStaff?.rol?.name || "",
        service: g.location?.name || null,
        marks: Object.fromEntries(dateKeys.map(k => [k, false])) as Record<string, boolean>,
      });
    }
    const row = byStaff.get(sid)!;
    const key = new Date(g.assignedDate).toISOString().slice(0,10);
    if (dateKeys.includes(key)) row.marks[key] = true;
    if (!row.service && g.location?.name) row.service = g.location.name;
  }

  // Build workbook
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Guardias Semana");

  // Title row
  const monthName = dates[0].toLocaleString("es-ES", { month: "long" }).toUpperCase();
  ws.mergeCells(1, 1, 1, 4 + dates.length);
  const titleCell = ws.getCell(1, 1);
  titleCell.value = `ROL DE COMISARIO DE GUARDIA - ${monthName}`;
  titleCell.alignment = { horizontal: "center", vertical: "middle" };
  titleCell.font = { bold: true, size: 14, color: { argb: "FFFFFFFF" } };
  titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFCC0000" } };
  ws.getRow(1).height = 24;

  // Header rows: columns and weekdays
  const baseHeaders = ["RANG", "APELLIDOS Y NOMBRES", "TELEFONO", "SERVICIO"];
  // Week runs from Tuesday to Monday; use fixed one-letter headers to match the provided template
  const dayHeaders = ["M", "M", "J", "V", "S", "D", "L"];
  const dateNumbers = dates.map((d) => d.getUTCDate());

  ws.addRow([...baseHeaders, ...dayHeaders]);
  ws.addRow(["", "", "", "", ...dateNumbers]);

  // Style header rows
  [2, 3].forEach((r) => {
    const row = ws.getRow(r);
    row.font = { bold: true };
    row.alignment = { horizontal: "center", vertical: "middle" };
    row.eachCell((cell: any) => {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: r === 2 ? "FFFFFF00" : "FFFFFFFF" } };
      cell.border = {
        top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" },
      };
    });
  });

  // Set column widths
  const widths = [12, 32, 16, 24, ...Array(dates.length).fill(6)];
  widths.forEach((w, i) => (ws.getColumn(i + 1).width = w));

  // Data rows
  for (const [, row] of byStaff) {
    const values = [
      row.rank,
      row.name,
      row.phone || "",
      row.service || "",
      ...dateKeys.map((k) => (row.marks[k] ? "X" : "")),
    ];
    ws.addRow(values);
  }

  // Borders for data
  for (let r = 4; r <= ws.rowCount; r++) {
    const row = ws.getRow(r);
    row.eachCell((cell: any) => {
      cell.border = {
        top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" },
      };
      cell.alignment = { horizontal: "center", vertical: "middle" };
    });
    // Left columns alignment tweaks
    ws.getCell(r, 2).alignment = { horizontal: "left", vertical: "middle" };
    ws.getCell(r, 4).alignment = { horizontal: "left", vertical: "middle" };
  }

  // Freeze headers
  ws.views = [{ state: "frozen", xSplit: 0, ySplit: 3 }];

  const buffer = await wb.xlsx.writeBuffer();
  return new NextResponse(Buffer.from(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename=guardias_semana_${startParam}.xlsx`,
      "Cache-Control": "no-store",
    },
  });
}
