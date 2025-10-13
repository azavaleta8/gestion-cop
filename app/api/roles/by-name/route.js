
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Busca un rol por su nombre
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get("name");

    if (!name) {
      return new Response(JSON.stringify({ message: "Nombre del rol no proporcionado" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const rol = await prisma.rol.findUnique({
      where: { name },
    });

    if (!rol) {
      return new Response(JSON.stringify({ message: "Rol no encontrado" }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ rol }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error al obtener el rol:', error);
    return new Response(JSON.stringify({ message: 'Error al obtener el rol', error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  } finally {
    await prisma.$disconnect();
  }
}