import { PrismaClient } from '@prisma/client';
import { decode } from "js-base64";

const prisma = new PrismaClient();

// Busca un trabajador por su id
export async function GET(req) {
  try {
    const url = new URL(req.url);
    const encodedId = url.pathname.split('/').pop(); // Extrae el ID codificado

    if (!encodedId) {
      return new Response(JSON.stringify({ message: "ID de funcionario no proporcionado" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const decodedId = decode(encodedId); // Decodifica el ID base64

    const funcionario = await prisma.staff.findUnique({
      where: { id: parseInt(decodedId) }, // Usa el ID real
    });

    if (!funcionario) {
      return new Response(JSON.stringify({ message: "Funcionario no encontrado" }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ funcionario }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error al obtener el funcionario:', error);
    return new Response(JSON.stringify({ message: 'Error al obtener el funcionario', error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  } finally {
    await prisma.$disconnect();
  }
}

// Elimina un trabajador por su id
export async function DELETE(req) {
  try {
    const url = new URL(req.url);
    const encodedId = url.pathname.split('/').pop(); // Extrae el ID codificado

    if (!encodedId) {
      return new Response(JSON.stringify({ message: "ID de funcionario no proporcionado" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const decodedId = decode(encodedId); // 🔓 Decodifica el ID base64
    
    const eliminado = await prisma.staff.delete({
      where: { id: parseInt(decodedId) }, // Usa el ID real
    });

    return new Response(JSON.stringify({ message: "Funcionario eliminado", eliminado }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error al eliminar el funcionario:', error);
    return new Response(JSON.stringify({ message: 'Error al eliminar el funcionario', error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  } finally {
    await prisma.$disconnect();
  }
}