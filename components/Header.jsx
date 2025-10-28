"use client";

import Link from "next/link";
import LogoutButton from "./LogoutButton";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

export default function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();

  // Función para verificar si la ruta está activa
  const isActive = (path) => {
    return pathname?.startsWith(path);
  };

  const navItems = [
    { href: "/home/localizaciones", label: "Localizaciones" },
    { href: "/home/trabajadores", label: "Trabajadores" },
    { href: "/home/guardias", label: "Gestión de Guardias" },
    { href: "/home/roles", label: "Gestión de Roles" },
  ];

  return (
    <header className="w-full bg-white border-b border-gray-100 shadow-sm">
      <div className="px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center">
            <Link 
              href="/" 
              className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent"
            >
              CENTRO DE OPERACIONES POLICIALES
            </Link>
          </div>

          {/* Navegación */}
          <nav className="flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${isActive(item.href)
                    ? "text-blue-700 bg-blue-50 shadow-sm"
                    : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                  }
                `}
              >
                {item.label}
                
                {/* Indicador activo */}
                {isActive(item.href) && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></div>
                )}
              </Link>
            ))}
          </nav>

          {/* Información de usuario */}
          <div className="flex items-center space-x-4">
            {session?.user && (
              <>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {(session.user.name || session.user.dni)?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm text-gray-700 font-medium">
                    {session.user.name || session.user.dni}
                  </span>
                </div>
                <div className="h-6 w-px bg-gray-200"></div>
                <LogoutButton />
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}