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