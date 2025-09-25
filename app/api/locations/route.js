import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Busca todas las localizaciones
export async function GET(req) {
  try {
    const localizaciones = await prisma.location.findMany();

    return new Response(JSON.stringify({ localizaciones }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error al obtener localizaciones:', error);
    return new Response(JSON.stringify({ message: 'Error al obtener localizaciones', error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  } finally {
    await prisma.$disconnect();
  }
}
