"use client";

import {
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
} from "@heroicons/react/24/solid";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function Localizacion() {
  const router = useRouter();
  const params = useParams(); // Hook para obtener los parámetros de la URL
  const id = params.id; // Obtiene el id de la URL
  const [localizacion, setLocalizacion] = useState(null);
  const [trabajadores, setTrabajadores] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [locationRes, staffRes] = await Promise.all([
          fetch(`/api/locations/${id}`),
          fetch(`/api/locations/${id}/staff`),
        ]);

        if (locationRes.ok) {
          const { location } = await locationRes.json();
          if (location) {
            setLocalizacion(location);
          } else {
            setMessage("No se pudieron cargar los datos de la localización.");
          }
        } else {
          setMessage("Error al cargar los datos de la localización.");
        }

        if (staffRes.ok) {
          const { staff } = await staffRes.json();
          if (staff) {
            setTrabajadores(staff);
          } else {
            setMessage("No se pudieron cargar los datos del personal.");
          }
        } else {
          setMessage("Error al cargar los datos del personal.");
        }
      } catch (error) {
        setMessage("Error de red al cargar los datos.");
        console.error("Error al cargar datos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  return (
    <main className="flex flex-col">
      <div className="flex h-[calc(100vh-74px)] overflow-hidden relative">
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
              <h1
                className="text-2xl font-bold text-white  p-4 rounded text-center"
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
            <table className="min-w-[80%] bg-white mx-auto border border-gray-300 rounded-lg shadow-lg mt-8 overflow-hidden">
              <thead className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 uppercase text-sm tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-left">Nombre</th>
                  <th className="px-4 py-3 text-left">Cédula</th>
                  <th className="px-4 py-3 text-left">Teléfono</th>
                  <th className="px-4 py-3 text-left">Cargo</th>
                  <th className="px-4 py-3 text-left">Guardia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {trabajadores.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="text-center px-4 py-4 text-gray-500 italic"
                    >
                      No hay trabajadores asignados
                    </td>
                  </tr>
                ) : (
                  trabajadores.map((trabajador) => (
                    <tr
                      key={trabajador.id}
                      className="hover:bg-gray-50 transition-colors duration-200"
                    >
                      <td className="px-4 py-3 text-sm text-gray-800 font-medium">
                        {trabajador.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {trabajador.dni}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {trabajador.phone}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {trabajador.rol?.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {trabajador.day ?? "No tiene día asignado"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </main>
  );
}
