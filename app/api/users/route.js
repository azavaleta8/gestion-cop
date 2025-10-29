import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// Busca todos los trabajadores con paginación y búsqueda
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const search = searchParams.get('search') || '';
    const sortBy = (searchParams.get('sortBy') || 'name').toString();
    const sortDirParam = (searchParams.get('sortDir') || 'asc').toString().toLowerCase();
    const sortDir = sortDirParam === 'desc' ? 'desc' : 'asc';

    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { dni: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    // Allowed sort fields coming from UI
    const allowedSortFields = new Set(['name', 'dni', 'total_assignments', 'last_guard']);
    const sortField = allowedSortFields.has(sortBy) ? sortBy : 'name';

    let funcionarios = [];
    const total = await prisma.staff.count({ where });

    // Special handling for DNI numeric sorting using a raw query (PostgreSQL)
    if (sortField === 'dni') {
      const likeTerm = `%${search}%`;
      const dirSql = sortDir === 'desc' ? Prisma.sql`DESC` : Prisma.sql`ASC`;

      // Build optional WHERE for raw query to match the Prisma where above
      const whereSql = search
        ? Prisma.sql`WHERE (s."name" ILIKE ${likeTerm} OR s."dni" ILIKE ${likeTerm})`
        : Prisma.empty;

      const rows = await prisma.$queryRaw(
        Prisma.sql`
          SELECT 
            s."id",
            s."dni",
            s."name",
            s."phone",
            s."day",
            s."last_guard",
            s."total_assignments",
            s."image",
            s."rolId",
            s."locationId",
            json_build_object('id', r."id", 'name', r."name") AS rol
          FROM "public"."Staff" s
          LEFT JOIN "public"."Rol" r ON r."id" = s."rolId"
          ${whereSql}
          ORDER BY CAST(s."dni" AS BIGINT) ${dirSql}
          LIMIT ${limit} OFFSET ${skip}
        `
      );
      funcionarios = rows;
    } else {
      // Default Prisma sorting for other fields
      const orderBy = { [sortField]: sortDir };
      funcionarios = await prisma.staff.findMany({
        where,
        skip,
        take: limit,
        include: { rol: true },
        orderBy,
      });
    }

    return new Response(JSON.stringify({ 
      funcionarios, 
      total,
      page,
      limit,
      sortBy: sortField,
      sortDir,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error al obtener funcionarios:', error);
    return new Response(JSON.stringify({ message: 'Error al obtener funcionarios', error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Agrega un nuevo funcionario
export async function POST(req) {
  try {
    const body = await req.json();

    // Verificar si ya existe un funcionario con ese DNI
    const existente = await prisma.staff.findUnique({
      where: { dni: body.dni }
    });

    if (existente) {
      return new Response(JSON.stringify({ error: "DNI duplicado" }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const nuevoFuncionario = await prisma.staff.create({
      data: {
        name: body.name,
        dni: body.dni,
        phone: body.phone,
        image: body.image, // base64 o URL
        rol: {
            connect: {
                id: parseInt(body.rolId, 10)
            }
        }
      },
    });

    return new Response(JSON.stringify({ staff: nuevoFuncionario }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error al crear el funcionario:', error);
    return new Response(JSON.stringify({ message: 'Error al crear el funcionario', error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
