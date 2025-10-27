import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Busca todos los roles
export async function GET(req) {
  try {
    const roles = await prisma.rol.findMany();

    return new Response(JSON.stringify({ roles }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error al obtener roles:', error);
    return new Response(JSON.stringify({ message: 'Error al obtener roles', error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  } finally {
    await prisma.$disconnect();
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
    return new Response(JSON.stringify({ message: 'Error al crear el rol', error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  } finally {
    await prisma.$disconnect();
  }
}