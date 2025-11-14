import Link from "next/link";

export default function NotFound() {
  return (
    <main className="w-full h-svh flex flex-col items-center justify-center gap-6">
      <h1 className="text-6xl font-extrabold">404</h1>
      <p className="text-lg">Página no encontrada</p>
      <div className="flex gap-4">
        <Link href="/" className="underline">
          Ir al inicio
        </Link>
      </div>
    </main>
  );
}
