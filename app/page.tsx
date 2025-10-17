import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await getServerSession();

  if (session) {
    redirect("/home");
  }
  return (
    <main className="min-h-screen gap-5 bg-gray-100 flex items-center justify-center">
      <div className="flex flex-col items-center mb-6">
        <h1 className="text-4xl font-bold text-gray-800">Bienvenido a</h1>
        <h1 className="text-4xl font-bold text-gray-800">gestión <span className="text-primary">COP</span></h1>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-sm">
        <Link
          href="/signin"
          className="bg-primary text-white py-3 rounded-lg text-center font-semibold hover:bg-primary/80 transition"
        >
          Iniciar sesión
        </Link>

        <Link
          href="/signup"
          className="border border-primary text-primary py-3 rounded-lg text-center font-semibold hover:bg-primary hover:text-white transition"
        >
          Registrarse
        </Link>
      </div>
    </main>
  );
}

