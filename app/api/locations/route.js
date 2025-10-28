import { prisma } from "@/lib/prisma";

// Busca todas las localizaciones con paginación
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const search = searchParams.get('search') || '';

    const skip = (page - 1) * limit;

    const where = search 
        ? {
            name: {
                contains: search,
                mode: 'insensitive',
            },
          }
        : {};

    const [locations, total] = await prisma.$transaction([
      prisma.location.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          name: 'asc', 
        },
      }),
      prisma.location.count({ where }),
    ]);

    return new Response(JSON.stringify({ 
      locations, 
      total,
      page,
      limit,
    }), {
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
