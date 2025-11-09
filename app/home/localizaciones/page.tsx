"use client";

import { PlusCircleIcon, PhotoIcon } from "@heroicons/react/24/solid";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@heroui/react";
import SearchBar from "@/components/SearchBar";
import Modal from "@/components/Modal";
import Table from "@/components/Table";
import useDebounce from "@/lib/hooks/useDebounce";
import LocationProfileModal from "@/components/LocationProfileModal";
import Image from 'next/image';
import { Tooltip } from "react-tooltip";

interface Localizacion {
    id: string;
    name: string;
    image: string;
    total_assignments?: number;
    last_guard?: string | null;
}

const LocalizacionesPage = () => {
    const [localizaciones, setLocalizaciones] = useState<Localizacion[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [message, setMessage] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [newName, setNewName] = useState("");
    const [newImage, setNewImage] = useState<File | null>(null);

    const [totalLocalizaciones, setTotalLocalizaciones] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [sortBy, setSortBy] = useState<keyof Localizacion>('total_assignments');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

    const [profileOpen, setProfileOpen] = useState(false);
    const [profileLocationId, setProfileLocationId] = useState<number | null>(null);

    const router = useRouter();
    const debouncedSearch = useDebounce(search, 500);

    const nameInputRef = useRef<HTMLInputElement | null>(null);

    const fetchLocationsData = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: String(currentPage),
                limit: String(itemsPerPage),
                search: debouncedSearch,
                sortBy: String(sortBy),
                sortDir: sortDir,
            });
            const res = await fetch(`/api/locations?${params.toString()}`);
            if (res.ok) {
                const { locations, total } = await res.json();
                if (locations) {
                    setLocalizaciones(Array.isArray(locations) ? locations : []);
                    setTotalLocalizaciones(total);
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

    useEffect(() => {
        fetchLocationsData();
    }, [currentPage, itemsPerPage, debouncedSearch, sortBy, sortDir]);

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
        if (!newName) {
            setMessage("Debes indicar un nombre para la localización.");
            return;
        }

        let imageData = null;
        if (newImage) {
            const base64 = await fileToBase64(newImage);
            imageData = base64.split(",")[1];
        }

        try {
            const res = await fetch("/api/locations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newName, image: imageData }),
            });

            if (res.ok) {
                setMessage("Localización creada exitosamente.");
                setNewName("");
                setNewImage(null);
                setShowForm(false);
                fetchLocationsData();
            } else {
                setMessage("Error al crear la localización.");
            }
        } catch (error) {
            console.error("Error al enviar localización:", error);
            setMessage("Error de red al crear la localización.");
        }
    };

    // Al abrir la modal, enfocar el primer input
    useEffect(() => {
        if (showForm) {
            // esperar al siguiente tick para asegurar que el input está montado
            requestAnimationFrame(() => {
                // Primero intentar el ref (por si Input forwardea refs). Si no, usar id como fallback.
                if (nameInputRef.current) {
                    nameInputRef.current.focus();
                } else {
                    const el = document.getElementById('location-name-input') as HTMLInputElement | null;
                    el?.focus();
                }
            });
        }
    }, [showForm]);

    return (
        <>

            <h1 className="text-2xl font-bold mb-5">Servicios</h1>

            <div className="flex gap-4 items-center mb-6">
                <div className="w-1/3">
                    <SearchBar
                        placeholder="Buscar localización por nombre..."
                        onSearchChange={setSearch}
                    />
                </div>
                <button
                    data-tooltip-id="register-service-button"
                    data-tooltip-content={"Crear nuevo servicio"}
                    data-tooltip-delay-show={200}
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
                title="Agregar Nueva Localización"
            >
                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-4"
                >
                    <div className="flex gap-4 items-end">
                        <Input
                            autoComplete="off"
                            id="location-name-input"
                            label="Nombre de la localización"
                            placeholder="Ej. Plaza Bolívar"
                            value={newName}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewName(e.target.value.toUpperCase())}
                            className="flex-grow"
                        />
                        <div>
                            <label
                                htmlFor="imagen"
                                className="cursor-pointer px-4 py-2 bg-blue-400 text-white rounded hover:bg-blue-500 transition flex justify-between items-center"
                            >
                                <span>{newImage ? "Imagen seleccionada" : "Seleccionar imagen"}</span>
                                <PhotoIcon className="w-5 h-5 ml-2" />
                            </label>
                            <input
                                id="imagen"
                                type="file"
                                accept="image/*"
                                onChange={(e) => e.target.files && setNewImage(e.target.files[0])}
                                className="hidden"
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 w-full"
                    >
                        Guardar localización
                    </button>
                </form>
            </Modal>

            <Table
                columns={[
                    {
                        header: 'Imagen',
                        accessor: 'image',
                        render: (item) => (
                            item.image ? (
                                <Image
                                    src={`data:image/png;base64,${item.image}`}
                                    alt={`Imagen de ${item.name}`}
                                    width={40}
                                    height={40}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-10 h-10 bg-gray-200 rounded-full" />
                            )
                        )
                    },
                    { header: 'Nombre', accessor: 'name', sortable: true },
                    { header: 'Guardias', accessor: 'total_assignments', sortable: true },
                    {
                        header: 'Última guardia',
                        accessor: 'last_guard',
                        sortable: true,
                        render: (item: Localizacion) => item.last_guard ? (
                            <span className="font-mono">
                                {new Date(item.last_guard).toLocaleDateString('es-ES', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric'
                                })}
                            </span>
                        ) : (
                            <span className="font-mono text-gray-400">—</span>
                        ),
                    },
                    /* {
                        header: 'Acciones', accessor: 'id', render: (item) => (
                            <button
                                className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
                                onClick={(e) => { e.stopPropagation(); setProfileLocationId(Number(item.id)); setProfileOpen(true); }}
                            >Ver Perfil</button>
                        )
                    }, */
                ]}
                data={localizaciones}
                loading={loading}
                totalItems={totalLocalizaciones}
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={setItemsPerPage}
                serverSortKey={sortBy}
                serverSortDir={sortDir}
                onSortChange={(key, dir) => { setSortBy(key); setSortDir(dir); setCurrentPage(1); }}
                onRowClick={(item) => {
                    setProfileLocationId(Number(item.id));
                    setProfileOpen(true);
                }}
            />

            <LocationProfileModal
                isOpen={profileOpen}
                onClose={() => setProfileOpen(false)}
                locationId={profileLocationId}
            />
            <Tooltip
                id="register-service-button"
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

export default LocalizacionesPage;