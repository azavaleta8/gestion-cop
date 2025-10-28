import { prisma } from "@/lib/prisma";

// Busca todos los trabajadores con paginación y búsqueda
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const search = searchParams.get('search') || '';

    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { dni: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [funcionarios, total] = await prisma.$transaction([
      prisma.staff.findMany({
        where,
        skip,
        take: limit,
        include: {
          rol: true, // Incluir la relación con Rol
        },
        orderBy: {
          name: 'asc',
        },
      }),
      prisma.staff.count({ where }),
    ]);

    return new Response(JSON.stringify({ 
      funcionarios, 
      total,
      page,
      limit,
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
