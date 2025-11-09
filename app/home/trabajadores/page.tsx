"use client";

import {
    PlusCircleIcon,
    PhotoIcon,
    UserCircleIcon,
    UserIcon
} from "@heroicons/react/24/solid";
import { useState, useEffect, useRef } from "react";
import { encode } from "js-base64";
import { Input, Button } from "@heroui/react";
import useDebounce from "@/lib/hooks/useDebounce";
import SearchBar from "@/components/SearchBar";
import Modal from "@/components/Modal";
import StaffProfileModal from "@/components/StaffProfileModal";
import Table from "@/components/Table";
import Image from 'next/image';
import { Tooltip } from 'react-tooltip';

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
    total_assignments?: number;
    last_guard?: string | null;
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
    const [sortKey, setSortKey] = useState<keyof Funcionario>('total_assignments');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
    const [profileModalOpen, setProfileModalOpen] = useState(false);
    const [selectedEncodedId, setSelectedEncodedId] = useState<string | null>(null);

    const debouncedSearch = useDebounce(search, 500);

    const nameInputRef = useRef<HTMLInputElement | null>(null);

    const fetchStaffData = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: String(currentPage),
                limit: String(itemsPerPage),
                search: debouncedSearch,
                sortBy: String(sortKey),
                sortDir: sortDir,
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
    }, [currentPage, itemsPerPage, debouncedSearch, sortKey, sortDir]);

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

    // Al abrir la modal, enfocar el primer input (nombre)
    useEffect(() => {
        if (showForm) {
            requestAnimationFrame(() => {
                if (nameInputRef.current) {
                    nameInputRef.current.focus();
                } else {
                    const el = document.getElementById('staff-name-input') as HTMLInputElement | null;
                    el?.focus();
                }
            });
        }
    }, [showForm]);

    const formularioCompleto = newName.trim() !== "" && newDni.trim() !== "" && newPhone.trim() !== "" && newRol !== "";

    const columns: { header: string; accessor: keyof Funcionario; render?: (item: Funcionario) => React.ReactNode; sortable?: boolean; sortValue?: (item: Funcionario) => string | number | Date | null | undefined }[] = [
        {
            header: 'Foto',
            accessor: 'image',
            render: (item: Funcionario) => (
                item.image ? (
                    <Image
                        src={`data:image/png;base64,${item.image}`}
                        alt={`Foto de ${item.name}`}
                        width={40}
                        height={40}
                        className="w-full h-full rounded-full object-cover"
                    />
                ) : (
                    <UserCircleIcon className="w-10 h-10 text-gray-400" />
                )
            ),
            sortable: false,
        },
        { header: 'Nombre', accessor: 'name', sortable: true, sortValue: (i) => i.name?.toLowerCase() },
        { header: 'Cédula', accessor: 'dni', sortable: true, sortValue: (i) => Number(i.dni) || 0 },
        { header: 'Teléfono', accessor: 'phone' },
        { header: 'Rango', accessor: 'rol', render: (item: Funcionario) => item.rol.name },
        { header: 'Servicios', accessor: 'total_assignments', render: (item: Funcionario) => item.total_assignments ?? 0, sortable: true, sortValue: (i) => i.total_assignments ?? 0 },
        {
            header: 'Última guardia',
            accessor: 'last_guard',
            render: (i: Funcionario) => i.last_guard ? (
                <span className="font-mono">
                    {new Date(i.last_guard).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                    })}
                </span>
            ) : (
                <span className="font-mono text-gray-400">—</span>
            ),
            sortable: true,
            sortValue: (i) => (i.last_guard ? new Date(i.last_guard) : null)
        },
        /* {
            header: 'Opciones', accessor: 'id', render: (item: Funcionario) => (
                <Button
                    data-tooltip-id="profile-cop-button"
                    data-tooltip-content={"Visualizar información del funcionario"}
                    color="primary"
                    className="px-4 py-2 text-white font-semibold rounded 
                    transition flex items-center gap-2 bg-green-600
                    hover:bg-green-700"
                    radius="sm"
                    size="md"
                    onPress={() => {
                        const encodedId = encode(item.id.toString());
                        setSelectedEncodedId(encodedId);
                        setProfileModalOpen(true);
                    }}
                >
                    <UserIcon className="w-5 h-5" />
                    Perfil
                </Button>
            )
        } */
    ];

    return (
        <>
            <h1 className="text-2xl font-bold mb-5">Funcionarios</h1>

            <div className="flex gap-4 items-center mb-6">
                <div className="w-1/3">
                    <SearchBar
                        placeholder="Buscar por nombre o cédula..."
                        onSearchChange={setSearch}
                    />
                </div>
                <button
                    data-tooltip-id="register-cop-button"
                    data-tooltip-content={"Crear nuevo funcionario"}
                    className={`mb-4 px-3 py-2 text-white font-semibold rounded
                        transition flex items-center gap-2 hover:cursor-pointer
                        ${showForm
                            ?
                            "bg-red-600 hover:bg-red-700"
                            :
                            "bg-green-600 hover:bg-green-700"
                        }`
                    }
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
                            <PlusCircleIcon className="w-5 h-5 font-semibold" />
                            Crear
                        </>
                    )}
                </button>
            </div>

            <Modal
                isOpen={showForm}
                onClose={() => setShowForm(false)}
                title="Registrar Nuevo Funcionario"
            >
                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-4"
                >
                    <Input
                        autoComplete="off"
                        id="staff-name-input"
                        label="Nombre del funcionario"
                        placeholder="Ej. Pedro Pérez"
                        value={newName}
                        onChange={(
                            e: React.ChangeEvent<HTMLInputElement>) =>
                            setNewName(e.target.value.toUpperCase()
                            )}
                    />
                    <Input
                        autoComplete="off"
                        type="text"
                        label="Cédula del funcionario"
                        placeholder="Ej. 12345678"
                        value={newDni}
                        onChange={(
                            e: React.ChangeEvent<HTMLInputElement>) => {
                            const soloNumeros =
                                e.target.value.replace(/\D/g, '');
                            setNewDni(soloNumeros);
                        }}
                    />
                    <Input
                        autoComplete="off"
                        type="text"
                        label="Teléfono del funcionario"
                        placeholder="Ej. 4123456789"
                        value={newPhone}
                        onChange={(
                            e: React.ChangeEvent<HTMLInputElement>) => {
                            const soloNumeros =
                                e.target.value.replace(/\D/g, '');
                            setNewPhone(soloNumeros);
                        }}
                    />
                    <div>
                        <label htmlFor="rol" className="block text-sm font-medium text-gray-700">Rol del funcionario</label>
                        <select
                            id="rol"
                            value={newRol}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewRol(e.target.value)}
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
                        className={`px-4 py-2 rounded text-white transition ${formularioCompleto
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
                    setSelectedEncodedId(encodedId);
                    setProfileModalOpen(true);
                }}
                serverSortKey={sortKey}
                serverSortDir={sortDir}
                onSortChange={(key, dir) => {
                    setSortKey(key as keyof Funcionario);
                    setSortDir(dir);
                    setCurrentPage(1);
                }}
            />

            <StaffProfileModal
                isOpen={profileModalOpen}
                onClose={() => setProfileModalOpen(false)}
                encodedId={selectedEncodedId}
            />

            <Tooltip
                id="register-cop-button"
                place="bottom"
                variant="info"
                offset={10}
            />
            <Tooltip
                id="profile-cop-button"
                place="bottom"
                variant="info"
                offset={10}
            />
            <Tooltip
                id="row-tooltip"
                place="bottom"
                variant="info"
                offset={5}
            />
        </>
    );
};

export default TrabajadoresPage;
