import Link from "next/link";

export default function Home() {
    return (
        <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
            <h1 className="text-4xl font-bold mb-4">Bienvenido a Gestion COP</h1>
            <p className="mb-8 text-lg text-gray-700">Has iniciado sesión correctamente.</p>
            <Link href="/register" className="text-blue-600 hover:underline">Registrar nuevo usuario</Link>
        </main>
    );
}
