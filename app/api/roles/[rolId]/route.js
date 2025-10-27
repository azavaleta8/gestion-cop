import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Busca un rol por su id
export async function GET(req) {
  try {
    const url = new URL(req.url);
    const idRol = url.pathname.split('/').pop(); // Extrae el ID desde la URL

    if (!idRol) {
      return new Response(JSON.stringify({ message: "ID de rol no proporcionado" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const rol = await prisma.rol.findUnique({
      where: { id: parseInt(idRol) },
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

export async function PUT(req) {
  try {
    const url = new URL(req.url);
    const idRol = url.pathname.split('/').pop();
    const { name } = await req.json();

    if (!name) {
      return new Response(JSON.stringify({ message: "El nombre es requerido" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const updatedRol = await prisma.rol.update({
      where: { id: parseInt(idRol) },
      data: { name },
    });

    return new Response(JSON.stringify(updatedRol), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error al actualizar el rol:', error);
    return new Response(JSON.stringify({ message: 'Error al actualizar el rol', error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(req) {
  try {
    const url = new URL(req.url);
    const idRol = url.pathname.split('/').pop();

    await prisma.rol.delete({
      where: { id: parseInt(idRol) },
    });

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('Error al eliminar el rol:', error);
    return new Response(JSON.stringify({ message: 'Error al eliminar el rol', error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  } finally {
    await prisma.$disconnect();
  }
}