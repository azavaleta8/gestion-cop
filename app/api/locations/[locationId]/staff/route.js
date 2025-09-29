// locations/[locationId]/staff/route.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Busca el personal asociado a una localización específica
export async function GET(req) {
  try {
    const url = new URL(req.url);
    const locationId = url.pathname.split('/').slice(-2)[0]; // Extrae el ID desde la URL

    if (!locationId || isNaN(locationId)) {
      return new Response(JSON.stringify({ message: "ID de localización no proporcionado o inválido" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const staff = await prisma.staff.findMany({
      where: { locationId: parseInt(locationId) },
      include: { rol: true },
    });

    return new Response(JSON.stringify({ staff }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error al obtener el staff por localización:', error);
    return new Response(JSON.stringify({
      message: 'Error al obtener el staff por localización',
      error: error.message,
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  } finally {
    await prisma.$disconnect();
  }
}