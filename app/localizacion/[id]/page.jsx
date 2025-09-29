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
  const [trabajadores, setTrabajadores] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [locationRes, staffRes] = await Promise.all([
          fetch(`/api/locations/${id}`),
          fetch(`/api/locations/${id}/staff`)
        ]);

        if (locationRes.ok) {
          const { location } = await locationRes.json();
          if (location) {
            setLocalizacion(location);
          } else {
            setMessage('No se pudieron cargar los datos de la localización.');
          }
        } else {
          setMessage('Error al cargar los datos de la localización.');
        }

        if (staffRes.ok) {
          const { staff } = await staffRes.json();
          if (staff) {
            setTrabajadores(staff);
          } else {
            setMessage('No se pudieron cargar los datos del personal.');
          }
        } else {
          setMessage('Error al cargar los datos del personal.');
        }

      } catch (error) {
        setMessage('Error de red al cargar los datos.');
        console.error('Error al cargar datos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
        <div className="flex flex-col flex-1 justify-start items-start overflow-auto">
            {loading && <p>Cargando...</p>}
            {/* Colocar "localizacion &&" evita que se renderice cuando localizacion es todavia null */}
            {localizacion && (
              <div
                className="sticky top-0 w-full h-[40vh] bg-cover bg-center flex justify-center items-center p-6 z-10"
                style={{
                  backgroundImage: `url(data:image/png;base64,${localizacion.image})`,
                }}
              >
                <h1 className="text-2xl font-bold text-white  p-4 rounded text-center"
                    style={{
                      backgroundColor: "rgba(0, 0, 0, 0.65)", // negro con 50% de opacidad
                    }}
                >
                  Información de la ubicación {localizacion.name}
                </h1>
              </div>
            )}

            {/* Tabla de los trabajadores de la localización */}
            {trabajadores && (
              <table className="min-w-[80%] bg-white mx-auto border border-gray-200 rounded shadow-md rounded-lg mt-8">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left px-4 py-2 border-b">Nombre</th>
                    <th className="text-left px-4 py-2 border-b">Cédula</th>
                    <th className="text-left px-4 py-2 border-b">Teléfono</th>
                    <th className="text-left px-4 py-2 border-b">Cargo</th>
                    <th className="text-left px-4 py-2 border-b">Guardia</th>
                  </tr>
                </thead>
                <tbody>
                  {trabajadores.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center px-4 py-2 border-b">
                        No hay trabajadores asignados
                      </td>
                    </tr>
                  ) : (
                    trabajadores.map((trabajador) => (
                      <tr key={trabajador.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 border-b">{trabajador.name}</td>
                        <td className="px-4 py-2 border-b">{trabajador.dni}</td>
                        <td className="px-4 py-2 border-b">{trabajador.phone}</td>
                      <td className="px-4 py-2 border-b">{trabajador.rol?.name}</td>
                      <td className="px-4 py-2 border-b">{trabajador.day ?? "No tiene día asignado"}</td>
                    </tr>
                  )))}
                </tbody>
              </table>)}
        </div>
      </div>
    </main>
  );
};