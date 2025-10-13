import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Busca todos los trabajadores
export async function GET(req) {
  try {
    const funcionarios = await prisma.staff.findMany({
      orderBy: {
        total_hours: 'asc'
      }
    });

    return new Response(JSON.stringify({ funcionarios }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error al obtener funcionario:', error);
    return new Response(JSON.stringify({ message: 'Error al obtener funcionario', error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  } finally {
    await prisma.$disconnect();
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
  } finally {
    await prisma.$disconnect();
  }
}
