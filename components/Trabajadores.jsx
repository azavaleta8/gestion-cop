"use client";

import {
  Card,
  Input,
} from "@heroui/react";
import { PlusIcon, PhotoIcon, UserCircleIcon  } from "@heroicons/react/24/solid";
import { useState, useEffect } from "react";
import Loader from "@/components/Loader";

const Trabajadores = () => {
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [search, setSearch] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [newName, setNewName] = useState("");
    const [newDni, setNewDni] = useState("");
    const [newPhone, setNewPhone] = useState("");
    const [newRol, setNewRol] = useState("");
    const [newImage, setNewImage] = useState(null);
    const [funcionarios, setFuncionarios] = useState([]);

    useEffect(() => {
        const fetchStaffData = async () => {
            setLoading(true);
            try {
            // 1. Obtener funcionarios y roles
            const res = await fetch("/api/users");
            const rolesRes = await fetch("/api/roles");

            if (!res.ok || !rolesRes.ok) {
                setMessage("Error al cargar los datos.");
                return;
            }

            const { funcionarios } = await res.json();
            const { roles } = await rolesRes.json();

            if (!funcionarios || !roles) {
                setMessage("No se pudieron cargar los datos.");
                return;
            }

            // 2. Crear un mapa de roles por ID
            const rolesMap = new Map(roles.map((rol) => [rol.id, rol.name]));

            // 3. Enriquecer cada funcionario con nameRol
            const funcionariosConNombreRol = funcionarios.map((f) => ({
                ...f,
                nameRol: rolesMap.get(f.rolId) || "Rol desconocido"
            }));

            console.log

            setFuncionarios(funcionariosConNombreRol);
            } catch (error) {
                setMessage("Error de red al cargar los datos.");
                console.error("Failed to fetch staff data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStaffData();
    }, []);

    
    // Transforma una imagen a base64
    const fileToBase64 = file => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
    });

    // Para buscar un rol por su nombre
    const obtenerRolIdPorNombre = async (rolNewName) => {
        try {
            const res = await fetch(`/api/roles/by-name?name=${encodeURIComponent(rolNewName)}`);

            if (!res.ok) {
                throw new Error("Rol no encontrado");
            }

            const { rol } = await res.json();
            return rol.id;
        } catch (error) {
            alert("⚠️ El rol ingresado no existe. Por favor verifica el nombre.");
            //throw error; // opcional: relanza el error si quieres manejarlo más arriba
        }
    };

    // Maneja el envío del formulario para agregar una nueva localización
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newName || !newDni || !newPhone || !newRol || !newImage) {
            setMessage("Debes completar todos los campos.");
            return;
        }

        // Convierte la imagen a base64 para enviarla a la API
        const base64 = await fileToBase64(newImage);
        const imageData = base64.split(",")[1]; // elimina el encabezado data:image/png;base64,

        try {

            // Buscar el ID del rol por su nombre
            const idRol = await obtenerRolIdPorNombre(newRol); 

            // Crear el funcionario en la base de datos
            const res = await fetch("/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newName, dni: newDni, phone: newPhone, rolId: idRol, image: imageData }),
            });

            if (res.ok) {
                const { staff } = await res.json();
                // Enriquecer el objeto con el nombre del rol
                const staffConNombreRol = {
                    ...staff,
                    nameRol: newRol, // ya se tiene en el input
                };
                setFuncionarios((prev) => [staffConNombreRol, ...prev]);
                setMessage("Funcionario agregado exitosamente.");
                setNewName("");
                setNewDni("");
                setNewPhone("");
                setNewRol("");
                setNewImage(null);
                setShowForm(false);
            } else if (res.status === 409) {
                alert("⚠️ El DNI ya está registrado. No se puede repetir.");
                setMessage("⚠️ El DNI ya está registrado. No se puede repetir.");
            } else {
                setMessage("Error al crear el funcionario.");
            }

        } catch (error) {
            console.error("Error al enviar el funcionario:", error);
            setMessage("Error de red al crear el funcionario.");
        }
    };

    const formularioCompleto = newName.trim() !== "" && newDni.trim() !== "" && newPhone.trim() !== "" &&  newRol.trim() !== "" && newImage !== null;

    return (
        <div className="flex flex-col items-center gap-6">
            <Card className="p-4 w-[22rem] items-center gap-2">
                <h2 className="text-2xl font-bold mb-2">Funcionarios</h2>

                <Input
                  label="Buscar Funcionario"
                  placeholder="Nombre"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-64"
                />
                
                {/* Botón para agregar un nuevo trabajador */}
                <button className={`mt-4 px-4 py-2 text-white rounded transition flex items-center gap-2 ${
                    showForm ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
                }`}

                    onClick={() => {
                        if (showForm) {
                            setNewName("");
                            setNewDni("");
                            setNewPhone("");
                            setNewRol("");
                            setNewImage(null);
                            setMessage("");
                        }
                        setShowForm((prev) => !prev);
                    }}
                >
                    {showForm ? "Cancelar" : (
                        <>
                            <PlusIcon className="w-5 h-5" />
                            Agregar nuevo funcionario
                        </>)}
                </button>

                {showForm && (
                    // Formulario para agregar nueva localización
                    <form
                        onSubmit={handleSubmit}
                        className="mt-4 flex flex-col gap-4 w-full items-center"
                    >
                        <Input
                            label="Nombre del funcionario"
                            placeholder="Ej. Pedro Pérez"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="w-64"
                        />
                        <Input
                            type="text"
                            label="Cedula del funcionario"
                            placeholder="Ej. 12345678"
                            value={newDni}
                            onChange={(e) => {
                                const soloNumeros = e.target.value.replace(/\D/g, '');
                                setNewDni(soloNumeros);
                            }}
                            className="w-64"
                        />
                        <Input
                            type="text"
                            label="Telefono del funcionario"
                            placeholder="Ej. 04123456789"
                            value={newPhone}
                            onChange={(e) => {
                                const soloNumeros = e.target.value.replace(/\D/g, '');
                                setNewPhone(soloNumeros);
                            }}

                            className="w-64"
                        />
                        <Input
                            label="Rol del funcionario"
                            placeholder="Ej. Sargento"
                            value={newRol}
                            onChange={(e) => setNewRol(e.target.value)}
                            className="w-64"
                        />
                        <div className="w-64">
                            <label
                                htmlFor="imagen"
                                className="cursor-pointer px-4 py-2 bg-blue-400 text-white rounded hover:bg-blue-500 transition flex justify-between items-center"
                            >
                                <span>{newImage ? "Imagen seleccionada" : "Seleccionar imagen"}</span>
                                <PhotoIcon className="w-5 h-5" />
                            </label>

                            <input
                                id="imagen"
                                type="file"
                                accept="image/*"
                                onChange={(e) => setNewImage(e.target.files[0])}
                                className="hidden"
                            />
                        </div>
                        <button
                        type="submit"
                        disabled={!formularioCompleto}
                        className={`px-4 py-2 rounded text-white transition ${
                            formularioCompleto
                            ? "bg-blue-600 hover:bg-blue-700"
                            : "bg-gray-400 cursor-not-allowed"
                        }`}
                        >
                            Guardar Funcionario
                        </button>
                    </form>
                )}
            </Card>

            <div className="w-full">
                {loading ? (
                <div className="flex flex-col items-center justify-center h-60 w-full">
                    <Loader />
                </div>
                ) : funcionarios.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-60 text-gray-500 w-full">
                        <img
                        src="/globe.svg"
                        alt="Sin funcionarios"
                        className="w-28 h-28 mb-2"
                        style={{ objectFit: "contain" }}
                        />
                        <span>No hay funcionarios actualmente</span>
                    </div>
                    ) : (
                        <div className="flex flex-wrap justify-center gap-6 w-full">
                            {/* Tabla de los funcionarios */}
                            <table className="min-w-[80%] bg-white mx-auto border border-gray-300 rounded-lg shadow-lg mt-8 overflow-hidden">
                                <thead className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 uppercase text-sm tracking-wider">
                                    <tr>
                                        <th className="px-4 py-3 text-left">Foto</th>
                                        <th className="px-4 py-3 text-left">Nombre</th>
                                        <th className="px-4 py-3 text-left">Cédula</th>
                                        <th className="px-4 py-3 text-left">Teléfono</th>
                                        <th className="px-4 py-3 text-left">Cargo</th>
                                        <th className="px-4 py-3 text-left">Guardia</th>
                                        <th className="px-4 py-3 text-left">Horas de guardias</th>
                                        <th className="px-4 py-3 text-left">Última Guardia</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                {funcionarios.map((trabajador) => (
                                    <tr key={trabajador.id} className="hover:bg-gray-50 transition-colors duration-200">
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                        {trabajador.image ? (
                                            <img
                                            src={`data:image/png;base64,${trabajador.image}`} // Transformamos la imagen a base64
                                            alt={`Foto de ${trabajador.name}`}
                                            className="w-10 h-10 rounded-full object-cover"
                                            />
                                        ) : (
                                            <UserCircleIcon className="w-10 h-10 text-gray-400" />
                                        )}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-800 font-medium">{trabajador.name}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{trabajador.dni}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{trabajador.phone}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{trabajador.nameRol}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{trabajador.day ?? "No tiene día asignado"}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{trabajador.total_hours}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{trabajador.last_guard ?? "Nunca ha realizado una guardia"}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                )}
            </div>
        </div>
    );
};

export default Trabajadores;