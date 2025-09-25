"use client";

import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import { ChevronDoubleLeftIcon, ChevronDoubleRightIcon } from "@heroicons/react/24/solid";
import { useState } from "react";
import { useRouter } from 'next/navigation';

export default function Localizacion() {
  const router = useRouter();
  //const { id } = router.query;

  const [sidebarVisible, setSidebarVisible] = useState(true);

  return (
    <main className="flex flex-col">
      {/* Vuelvo a carggar la TopBar y la Sidear */}
      <TopBar />
      <div className="flex h-[calc(100vh-74px)] overflow-hidden relative">
        {/* Sidebar */}
        <aside
          className={`bg-slate-100 h-full border-r-[2px] border-blue-200 transition-all duration-400 ${
            sidebarVisible ? "w-64 p-8" : "w-0 p-0"
          } overflow-hidden flex flex-col justify-between`}
        >
            <Sidebar onSelect={(section) => {
              router.push(`/home?section=${section}`); // Navega al dashboard
            }} />

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
            <h1>Información de la ubicación {router.id}</h1>
            {/* Renderiza más detalles aquí */}
        </div>
      </div>
    </main>
  );
};