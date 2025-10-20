import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Protect all routes except the public/auth ones
const PUBLIC_FILE =
  /^\/_next\/|^\/api\/auth\/|^\/api\/|^\/signin|^\/signup|^\/public|\/.well-known\//;

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (PUBLIC_FILE.test(pathname) || pathname === "/") {
    return NextResponse.next();
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/signin";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/home/:path*", "/protected/:path*", "/"],
};
