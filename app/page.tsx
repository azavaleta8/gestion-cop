import LoginForm from "@/components/LoginForm"; // o ruta relativa
import Link from "next/link";

export default function HomePage() {
  return ( 
    <main className="min-h-screen gap-5 bg-gray-100 flex items-center justify-center">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">Bienvenido a <span className="text-primary">COP</span></h1>

      <div className="flex flex-col gap-4 w-full max-w-sm">
        <Link
          href="/login"
          className="bg-primary text-white py-3 rounded-lg text-center font-semibold hover:bg-primary/80 transition"
        >
          Iniciar sesión
        </Link>

        <Link
          href="/register"
          className="border border-primary text-primary py-3 rounded-lg text-center font-semibold hover:bg-primary hover:text-white transition"
        >
          Registrarse
        </Link>
      </div>
    </main>
  );
}

