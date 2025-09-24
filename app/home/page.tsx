"use client";

import Sidebar from "@/components/Sidebar";
import ProfileCard from "@/components/ProfileCard";
import TopBar from "@/components/TopBar";
import Horarios from "@/components/Horarios";
import Documentos from "@/components/Documentos";
import Localizaciones from "@/components/Localizaciones";
import Trabajadores from "@/components/Trabajadores";
import Configuracion from "@/components/Configuracion";

import { ChevronDoubleLeftIcon, ChevronDoubleRightIcon } from "@heroicons/react/24/solid";
import { useState } from "react";
import { useSearchParams } from 'next/navigation';

export default function Dashboard() {
  const params = useSearchParams();
  const defaultSection = params.get('section') || 'perfil'; // Extraemos la seccion clickeada de la sidebar cuando estamos en otra ruta, por ejemplo la ruta de localizacion/[id]/page.jsx
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [activeSection, setActiveSection] = useState(defaultSection);

  // Permite renderizar el componente especifico seleccionado del sidebar
  const renderContent = () => {
    switch (activeSection) {
      case "perfil":
        return <ProfileCard />;
      case "localizaciones":
        return <Localizaciones />;
      case "trabajadores":
        return <Trabajadores />;
      case "horarios":
        return <Horarios />;
      case "documentos":
        return <Documentos />;
      case "configuracion":
        return <Configuracion />;
      default:
        return <ProfileCard />;
    }
  };

  return (
    <main className="flex flex-col">
      <TopBar />
      <div className="flex h-[calc(100vh-74px)] overflow-hidden relative">
        {/* Sidebar */}
        <aside
          className={`bg-slate-100 h-full border-r-[2px] border-blue-200 transition-all duration-400 ${
            sidebarVisible ? "w-64 p-8" : "w-0 p-0"
          } overflow-hidden flex flex-col justify-between`}
        >
            <Sidebar onSelect={setActiveSection}/>
            {/* Botón toggle fijo en la esquina inferior izquierda */}
            <button
                onClick={() => setSidebarVisible(!sidebarVisible)}
                className={`absolute bottom-4 left-0 z-20 bg-blue-500 text-white p-2 rounded-r hover:bg-blue-600 transition-all duration-400 ${
                    sidebarVisible ? "ml-64" : "ml-0"
                }`}
            >
                {sidebarVisible ? (
                    <ChevronDoubleLeftIcon className="h-6 w-6" />
                ) : (
                    <ChevronDoubleRightIcon className="h-6 w-6" />
                )}
            </button>
        </aside>

        {/* Contenido principal del perfil */}
        <div className="flex flex-1 justify-center items-start p-10 overflow-auto">
          {renderContent()}
        </div>
      </div>
    </main>
  );
}