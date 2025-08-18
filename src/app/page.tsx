import LoginForm from "@/src/components/LoginForm"; // o ruta relativa
import { Link } from "@heroui/react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function HomePage() {

  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center">
      <h1 className="text-4xl font-bold mb-4">Bienvenido a Gestion COP</h1>
      <p className="mb-8 text-lg text-gray-700">Has iniciado sesión correctamente.</p>
      <Link href="/register" className="text-blue-600 hover:underline">Registrar nuevo usuario</Link>
    </main>
  );
}

