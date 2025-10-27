"use client";

import Sidebar from "@/components/Sidebar";
import { ChevronDoubleLeftIcon, ChevronDoubleRightIcon } from "@heroicons/react/24/solid";
import { useEffect, useState } from "react";
import { useRouter, useParams } from 'next/navigation';

export default function Localizacion() {
  const router = useRouter();
  const params = useParams(); // Hook para obtener los parámetros de la URL
  const id = params.id; // Obtiene el id de la URL
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [funcionario, setFuncionario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [roles, setRoles] = useState([]);
  const [selectedRolId, setSelectedRolId] = useState('');

  useEffect(() => {
        const fetchUserData = async () => {
            setLoading(true);
            try {
              const res = await fetch(`/api/users/${id}`); // Traemos el funcionario
              if (res.ok) {
                const { funcionario } = await res.json(); // Las pasamos a json
                if (funcionario) {
                    setFuncionario(funcionario);
                    setSelectedRolId(funcionario.rolId);
                } else {
                    setMessage('No se pudieron cargar los datos del funcionario.');
                }
              } else {
                setMessage('Error al cargar los datos del funcionario.');
              }

            } catch (error) {
              setMessage('Error de red al cargar los datos del funcionario.');
              console.error('Failed to fetch user data', error);
            } finally {
              setLoading(false);
            }
        };
        const fetchRoles = async () => {
            try {
                const res = await fetch('/api/roles');
                if(res.ok) {
                    const { roles } = await res.json();
                    setRoles(roles);
                }
            } catch (error) {
                console.error('Failed to fetch roles', error);
            }
        }
        fetchUserData();
        fetchRoles();
    }, [id]);

  const handleUpdate = async () => {
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rolId: parseInt(selectedRolId) }),
      });
      if (res.ok) {
        setIsEditing(false);
        // Optionally, refetch user data to show updated info
        const updatedFuncionario = await res.json();
        setFuncionario(updatedFuncionario.funcionario);
      } else {
        setMessage('Error al actualizar el funcionario.');
      }
    } catch (error) {
        setMessage('Error de red al actualizar el funcionario.');
    }
  };

  return (
    <main className="flex flex-col">
        <div className="flex h-screen overflow-hidden relative">
            {/* Sidebar */}
            <aside
              className={`bg-slate-100 h-full border-r-[2px] border-blue-200 transition-all duration-400 ${
                sidebarVisible ? "w-64 p-8" : "w-0 p-0"
              } overflow-hidden flex flex-col justify-between`}
            >
                <Sidebar />
    
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
            <div className="p-4">
                {funcionario ? (
                    <div className="text-sm text-gray-700 space-y-2">
                        <p><strong>Nombre:</strong> {funcionario.name}</p>
                        <p><strong>DNI:</strong> {funcionario.dni}</p>
                        <p><strong>Teléfono:</strong> {funcionario.phone}</p>
                        <p><strong>Última guardia:</strong> {funcionario.last_guard}</p>
                        <p><strong>Total de horas:</strong> {funcionario.total_hours}</p>
                        
                        {isEditing ? (
                            <div className="flex items-center gap-4 mt-4">
                                <select value={selectedRolId} onChange={(e) => setSelectedRolId(e.target.value)} className="p-2 border rounded-md">
                                    {roles.map(rol => <option key={rol.id} value={rol.id}>{rol.name}</option>)}
                                </select>
                                <button onClick={handleUpdate} className="px-4 py-2 bg-green-500 text-white rounded-md">Guardar</button>
                                <button onClick={() => setIsEditing(false)} className="px-4 py-2 bg-gray-300 rounded-md">Cancelar</button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4 mt-4">
                                <p><strong>Rol:</strong> {funcionario.rol?.name}</p>
                                <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-blue-500 text-white rounded-md">Cambiar Rol</button>
                            </div>
                        )}
                    </div>
                ) : (
                    <p className="text-gray-500">{loading ? "Cargando..." : message}</p>
                )}
            </div>

          </div>
        </main>
  );
};