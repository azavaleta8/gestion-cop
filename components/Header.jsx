"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import LogoutButton from "./LogoutButton";

export default function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Cerrar menú al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Si no hay sesión, no renderizar nada
  if (!session) {
    return null;
  }
  // Función para verificar si la ruta está activa
  const isActive = (path) => {
    return pathname?.startsWith(path);
  };

  const navItems = [
    { href: "guardias", label: "Guardias" },
    { href: "trabajadores", label: "Funcionarios" },
    { href: "localizaciones", label: "Servicios" },
    { href: "roles", label: "Rangos" },
  ];

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/signout", { method: "POST" });
      setIsMenuOpen(false);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <header className="w-full bg-white border-b border-gray-100 shadow-sm">
      <div className="px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center">
            <Link
              href="/"
              className="text-xl font-bold bg-clip-text text-blue-800"
            >
              CENTRO DE OPERACIONES POLICIALES
            </Link>
          </div>

          <div className="flex items-center">
            {/* Navegación */}
            <nav className="flex items-center space-x-1 mr-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    relative px-4 py-2 rounded-lg text-lg font-bold
                    transition-all duration-200
                    ${
                      isActive(item.href)
                        ? "text-blue-800 cursor-default"
                        : `text-gray-800 hover:text-white hover:bg-blue-800
                        hover:shadow-md hover:rounded-full`
                    }
                  `}
                >
                  {item.label}

                  {/* Indicador activo */}
                  {isActive(item.href) && (
                    <div
                      className="absolute bottom-0 left-0 w-full h-0.5
                        bg-blue-800"
                    />
                  )}
                </Link>
              ))}
            </nav>

            {/* Botón de cierre de sesión */}
            {session?.user && (
              <div className="flex items-center">
                <button
                  onClick={handleLogout}
                  className="w-full text-center text-lg font-medium
                        text-red-600 hover:bg-red-50 transition-colors flex
                        items-center"
                >
                  <svg
                    className="w-8 h-8 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3
                            3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  <LogoutButton />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
