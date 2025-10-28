"use client";

import { PlusIcon, PhotoIcon, UserCircleIcon } from "@heroicons/react/24/solid";
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { encode } from "js-base64";
import { Input, Button } from "@heroui/react";
import useDebounce from "@/lib/hooks/useDebounce";
import SearchBar from "@/components/SearchBar";
import Modal from "@/components/Modal";
import Table from "@/components/Table";

interface Rol {
    id: number;
    name: string;
}

interface Funcionario {
    id: number;
    name: string;
    dni: string;
    phone: string;
    rol: Rol;
    image: string;
    day?: string;
    total_hours?: number;
    last_guard?: string;
}

const TrabajadoresPage = () => {
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [search, setSearch] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [newName, setNewName] = useState("");
    const [newDni, setNewDni] = useState("");
    const [newPhone, setNewPhone] = useState("");
    const [newRol, setNewRol] = useState("");
    const [newImage, setNewImage] = useState<File | null>(null);
    const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
    const [roles, setRoles] = useState<Rol[]>([]);
    const [totalFuncionarios, setTotalFuncionarios] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const router = useRouter();
    const debouncedSearch = useDebounce(search, 500);

    const fetchStaffData = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: String(currentPage),
                limit: String(itemsPerPage),
                search: debouncedSearch,
            });
            const [staffRes, rolesRes] = await Promise.all([
                fetch(`/api/users?${params.toString()}`),
                fetch("/api/roles")
            ]);

            if (!staffRes.ok || !rolesRes.ok) {
                setMessage("Error al cargar los datos.");
                return;
            }

            const { funcionarios, total } = await staffRes.json();
            const { roles } = await rolesRes.json();

            if (funcionarios && total !== undefined && roles) {
                setFuncionarios(Array.isArray(funcionarios) ? funcionarios : []);
                setTotalFuncionarios(total);
                setRoles(Array.isArray(roles) ? roles : []);
            } else {
                setMessage("No se pudieron cargar los datos.");
            }
        } catch (error) {
            setMessage("Error de red al cargar los datos.");
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStaffData();
    }, [currentPage, itemsPerPage, debouncedSearch]);

    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearch]);
    
    // Transforma una imagen a base64
    const fileToBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
            resolve(reader.result);
        } else {
            reject(new Error('Failed to convert file to base64 string'));
        }
      };
      reader.onerror = reject;
    });

    // Maneja el envío del formulario para agregar una nueva localización
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!newName || !newDni || !newPhone || !newRol) {
            setMessage("Debes completar todos los campos obligatorios.");
            return;
        }

        let imageData = null;
        if (newImage) {
            const base64 = await fileToBase64(newImage);
            imageData = base64.split(",")[1];
        }

        try {
            const idRol = parseInt(newRol);
            const res = await fetch("/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newName, dni: newDni, phone: newPhone, rolId: idRol, image: imageData }),
            });

            if (res.ok) {
                setMessage("Funcionario agregado exitosamente.");
                setNewName("");
                setNewDni("");
                setNewPhone("");
                setNewRol("");
                setNewImage(null);
                setShowForm(false);
                fetchStaffData(); // Recargar datos
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

    const formularioCompleto = newName.trim() !== "" && newDni.trim() !== "" && newPhone.trim() !== "" &&  newRol !== "";

    const columns: { header: string; accessor: keyof Funcionario; render?: (item: Funcionario) => React.ReactNode }[] = [
        {
            header: 'Foto',
            accessor: 'image',
            render: (item: Funcionario) => (
                item.image ? (
                    <img
                        src={`data:image/png;base64,${item.image}`}
                        alt={`Foto de ${item.name}`}
                        className="w-10 h-10 rounded-full object-cover"
                    />
                ) : (
                    <UserCircleIcon className="w-10 h-10 text-gray-400" />
                )
            )
        },
        { header: 'Nombre', accessor: 'name' },
        { header: 'Cédula', accessor: 'dni' },
        { header: 'Teléfono', accessor: 'phone' },
        { header: 'Cargo', accessor: 'rol', render: (item: Funcionario) => item.rol.name },
        { header: 'Opciones', accessor: 'id', render: (item: Funcionario) => (
            <Button
                color="primary"
                className="px-4 py-2 text-white rounded transition flex items-center gap-2 bg-green-600 hover:bg-green-700"
                radius="sm"
                size="md"
                onPress={() => {
                    const encodedId = encode(item.id.toString());
                    router.push(`/trabajador/${encodedId}`);
                }}
            >
                Ver Perfil
            </Button>
        )}
    ];

    return (
        <>
            <h1 className="text-2xl font-bold mb-5">Funcionarios</h1>
  
            <div className="flex justify-between items-center mb-6">
                <div className="w-1/3">
                    <SearchBar
                        placeholder="Buscar por nombre o cédula..."
                        onSearchChange={setSearch}
                    />
                </div>
                <button className={`px-4 py-2 text-white rounded transition flex items-center gap-2 ${
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
                        </>
                    )}
                </button>
            </div>

            <Modal
                isOpen={showForm}
                onClose={() => setShowForm(false)}
                title="Agregar Nuevo Funcionario"
            >
                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-4"
                >
                    <Input
                        label="Nombre del funcionario"
                        placeholder="Ej. Pedro Pérez"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                    />
                    <Input
                        type="text"
                        label="Cédula del funcionario"
                        placeholder="Ej. 12345678"
                        value={newDni}
                        onChange={(e) => {
                            const soloNumeros = e.target.value.replace(/\D/g, '');
                            setNewDni(soloNumeros);
                        }}
                    />
                    <Input
                        type="text"
                        label="Teléfono del funcionario"
                        placeholder="Ej. 04123456789"
                        value={newPhone}
                        onChange={(e) => {
                            const soloNumeros = e.target.value.replace(/\D/g, '');
                            setNewPhone(soloNumeros);
                        }}
                    />
                    <div>
                        <label htmlFor="rol" className="block text-sm font-medium text-gray-700">Rol del funcionario</label>
                        <select
                            id="rol"
                            value={newRol}
                            onChange={(e) => setNewRol(e.target.value)}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        >
                            <option value="">Seleccione un rol</option>
                            {roles.map((rol) => (
                                <option key={rol.id} value={rol.id}>
                                    {rol.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
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
                            onChange={(e) => e.target.files && setNewImage(e.target.files[0])}
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
            </Modal>

            <Table
                columns={columns}
                data={funcionarios}
                loading={loading}
                totalItems={totalFuncionarios}
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={setItemsPerPage}
                onRowClick={(item) => {
                    const encodedId = encode(item.id.toString());
                    router.push(`/trabajador/${encodedId}`);
                }}
            />
        </>
    );
};

export default TrabajadoresPage;
