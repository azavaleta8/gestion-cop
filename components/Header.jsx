"use client";

import Link from "next/link";
import LogoutButton from "./LogoutButton";
import { useSession } from "next-auth/react";

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="w-full px-6 py-4 flex justify-between items-center bg-white shadow-sm">
      <div>
        <Link href="/" className="font-bold text-lg">
          Gestion COP
        </Link>
      </div>
      <nav className="flex items-center gap-4 flex-wrap">
        <Link href="/home/localizaciones" className="text-blue-600 hover:underline text-left">
            Localizaciones
        </Link>
        <Link href="/home/trabajadores" className="text-blue-600 hover:underline text-left">
            Trabajadores
        </Link>
        <Link href="/home/guardias" className="text-blue-600 hover:underline text-left">
            Gestión de Guardias
        </Link>
        <Link href="/home/roles" className="text-blue-600 hover:underline text-left">
            Gestión de Roles
        </Link>
        {session?.user && (
          <>
            <span className="text-sm">
              {session.user.name || session.user.dni}
            </span>
            <LogoutButton />
          </>
        )}
      </nav>
    </header>
  );
}
