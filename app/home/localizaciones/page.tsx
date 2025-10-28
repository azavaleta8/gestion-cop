"use client";

import { PlusIcon, PhotoIcon } from "@heroicons/react/24/solid";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@heroui/react";
import SearchBar from "@/components/SearchBar";
import Modal from "@/components/Modal";
import Table from "@/components/Table";
import Loader from "@/components/Loader";
import useDebounce from "@/lib/hooks/useDebounce";

interface Localizacion {
    id: string;
    name: string;
    image: string;
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
    
    const router = useRouter();
    const debouncedSearch = useDebounce(search, 500);

    const fetchLocationsData = async () => {
        setLoading(true);
        try {
          const params = new URLSearchParams({
              page: String(currentPage),
              limit: String(itemsPerPage),
              search: debouncedSearch,
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
                const { location } = await res.json();
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

    return (
        <>

            <h1 className="text-2xl font-bold mb-5">Servicios</h1>

            <div className="flex justify-between items-center mb-6">
                <div className="w-1/3">
                    <SearchBar
                        placeholder="Buscar localización por nombre..."
                        onSearchChange={setSearch}
                    />
                </div>
                <button className={`px-4 py-2 text-white rounded transition flex items-center gap-2 ${
                    showForm ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
                }`}
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
                            <PlusIcon className="w-5 h-5" />
                            Agregar nueva localización
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
                            label="Nombre de la localización"
                            placeholder="Ej. Plaza Bolívar"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
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
                                <img
                                src={`data:image/png;base64,${item.image}`}
                                alt={`Imagen de ${item.name}`}
                                className="w-10 h-10 rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-10 h-10 bg-gray-200 rounded-full" />
                            )
                        )
                    },
                    { header: 'Nombre', accessor: 'name' },
                    { header: 'ID', accessor: 'id' },
                ]}
                data={localizaciones}
                loading={loading}
                totalItems={totalLocalizaciones}
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={setItemsPerPage}
                onRowClick={(item) => router.push(`/localizacion/${item.id}`)}
            />
        </>
    );
};

export default LocalizacionesPage;