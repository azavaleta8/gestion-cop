import { prisma } from "@/lib/prisma";

// Busca todas las localizaciones
export async function GET(req) {
  try {
    const locations = await prisma.location.findMany();

    return new Response(JSON.stringify({ locations }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error al obtener localizaciones:', error);
    return new Response(JSON.stringify({ message: 'Error al obtener localizaciones', error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Agrega una nueva localización
export async function POST(req) {
  try {
    const body = await req.json();

    const nuevaLocalizacion = await prisma.location.create({
      data: {
        name: body.name,
        image: body.image, // base64 o URL
      },
    });

    return new Response(JSON.stringify({ location: nuevaLocalizacion }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error al crear la localización:', error);
    return new Response(JSON.stringify({ message: 'Error al crear la localización', error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
