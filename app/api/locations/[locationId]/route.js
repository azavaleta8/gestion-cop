import { prisma } from "@/lib/prisma";

// (No esta listo aun)
/*
export async function DELETE(req) {
    try {
        const url = new URL(req.url);
        const userId = url.pathname.split('/').pop(); // Extraer el ID del usuario de la URL

        if (!userId) {
            return new Response(JSON.stringify({ message: "ID de usuario no proporcionado" }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const deletedUser = await prisma.user.delete({
            where: { id: userId },
        });

        return new Response(JSON.stringify({ message: "Usuario eliminado correctamente", user: deletedUser }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        return new Response(JSON.stringify({ message: 'Error al eliminar usuario', error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    } finally {
        await prisma.$disconnect();
    }
}*/

// Busca una localizacion por su id
export async function GET(req) {
  try {
    const url = new URL(req.url);
    const idLocalizacion = url.pathname.split('/').pop(); // Extrae el ID desde la URL

    if (!idLocalizacion) {
      return new Response(JSON.stringify({ message: "ID de localización no proporcionado" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const location = await prisma.location.findUnique({
      where: { id: parseInt(idLocalizacion) },
    });

    if (!location) {
      return new Response(JSON.stringify({ message: "Localización no encontrada" }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ location }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error al obtener la localización:', error);
    return new Response(JSON.stringify({ message: 'Error al obtener la localización', error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Actualiza una localizacion por su id (No esta listo aun)
/*
export async function PATCH(req) {
    try {
        const url = new URL(req.url);
        const userId = url.pathname.split('/').pop();
        const { name, image } = await req.json();
        const dataToUpdate = {};
        if (name) dataToUpdate.name = name;
        if (image) dataToUpdate.image = image;

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: dataToUpdate,
        });

        return new Response(JSON.stringify(updatedUser), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Error al actualizar el usuario:', error);
        return new Response(JSON.stringify({ message: 'Error al actualizar el usuario', error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}*/