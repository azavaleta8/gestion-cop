import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Busca todos los roles
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const search = searchParams.get('search') || '';

    const offset = (page - 1) * limit;

    const where = search
      ? {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        }
      : {};

    const [roles, total] = await Promise.all([
      prisma.rol.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: {
          id: 'asc',
        },
      }),
      prisma.rol.count({ where }),
    ]);

    return new Response(JSON.stringify({ roles, total }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error al obtener roles:', error);
    return new Response(JSON.stringify({ message: 'Error al obtener roles', error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function POST(req) {
  try {
    const { name } = await req.json();

    if (!name) {
      return new Response(JSON.stringify({ message: 'El nombre del rol es requerido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const newRol = await prisma.rol.create({
      data: {
        name,
      },
    });

    return new Response(JSON.stringify(newRol), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error al crear el rol:', error);
    if (error.code === 'P2002') {
        return new Response(JSON.stringify({ message: 'Ya existe un rol con este nombre.' }), {
            status: 409, // Conflict
            headers: { 'Content-Type': 'application/json' },
        });
    }
    return new Response(JSON.stringify({ message: 'Error al crear el rol', error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}