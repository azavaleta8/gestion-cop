import { NextResponse } from "next/server";

// Endpoint para limpiar las cookies de sesión de NextAuth (JWT)
export async function POST() {
  const res = NextResponse.json({ ok: true });

  const cookiesToClear = [
    "next-auth.session-token",
    "__Secure-next-auth.session-token",
    "next-auth.csrf-token",
    "__Host-next-auth.csrf-token",
  ];

  cookiesToClear.forEach((name) => {
    res.cookies.set({ name, value: "", path: "/", expires: new Date(0) });
  });

  return res;
}

// Soporte opcional por si se llama vía GET
export async function GET() {
  return POST();
}
