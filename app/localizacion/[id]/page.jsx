"use client";

import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import { ChevronDoubleLeftIcon, ChevronDoubleRightIcon } from "@heroicons/react/24/solid";
import { useEffect, useState } from "react";
import { useRouter, useParams } from 'next/navigation';

export default function Localizacion() {
  const router = useRouter();
  const params = useParams(); // Hook para obtener los parámetros de la URL
  const id = params.id; // Obtiene el id de la URL
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [localizacion, setLocalizacion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
        const fetchLocationData = async () => {
            setLoading(true);
            try {
              const res = await fetch(`/api/locations/${id}`); // Traemos la localización por su id
              if (res.ok) {
                const { location } = await res.json(); // Las pasamos a json
                if (location) {
                    setLocalizacion(location);
                } else {
                    setMessage('No se pudieron cargar los datos de las localizaciones.');
                }
              } else {
                setMessage('Error al cargar los datos de las localizaciones.');
              }

            } catch (error) {
              setMessage('Error de red al cargar los datos de las localizaciones.');
              console.error('Failed to fetch location data', error);
            } finally {
              setLoading(false);
            }
        };
        fetchLocationData();
  }, [id]);

  
  return (
    <main className="flex flex-col">
      {/* Vuelvo a cargar la TopBar y la Sidear */}
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
            {loading && <p>Cargando...</p>}
            {/* Colocar "localizacion &&" evita que se renderice cuando localizacion es todavia null */}
            {localizacion && (
              <div>
                <h1>Información de la ubicación {localizacion.name}</h1>
                <img src={`data:image/png;base64,${localizacion.image}`} alt={localizacion.name} className="w-96 h-96 object-cover mb-4" />
              </div>
            )}

            {/* Renderiza más detalles aquí */}
        </div>
      </div>
    </main>
  );
};