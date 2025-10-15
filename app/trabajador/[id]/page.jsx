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
  const [funcionario, setFuncionario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
        const fetchUserData = async () => {
            setLoading(true);
            try {
              const res = await fetch(`/api/users/${id}`); // Traemos el funcionario
              if (res.ok) {
                const { funcionario } = await res.json(); // Las pasamos a json
                if (funcionario) {
                    setFuncionario(funcionario);
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
        fetchUserData();
    }, []);

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
            <div className="p-4">
                {funcionario ? (
                    <div className="text-sm text-gray-700 space-y-2">
                        <p><strong>Nombre:</strong> {funcionario.name}</p>
                        <p><strong>DNI:</strong> {funcionario.dni}</p>
                        <p><strong>Teléfono:</strong> {funcionario.phone}</p>
                        <p><strong>Última guardia:</strong> {funcionario.last_guard}</p>
                        <p><strong>Total de horas:</strong> {funcionario.total_hours}</p>
                    </div>
                ) : (
                    <p className="text-gray-500">{loading ? "Cargando..." : message}</p>
                )}
            </div>

          </div>
        </main>
  );
};