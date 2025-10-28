"use client";

import {
  Button,
  Input
} from "@heroui/react";
import { PlusIcon, PhotoIcon  } from "@heroicons/react/24/solid";
import { useState, useEffect } from "react";
import Loader from "@/components/Loader";
import { useRouter } from "next/navigation";
import SearchBar from "@/components/SearchBar";
import Modal from "@/components/Modal";

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
    
    const router = useRouter();

    useEffect(() => {
        const fetchLocationsData = async () => {
            setLoading(true);
            try {
              const res = await fetch("/api/locations"); // Traemos todas las localizaciones
              if (res.ok) {
                const { locations } = await res.json(); // Las pasamos a json
                if (locations) {
                    setLocalizaciones(Array.isArray(locations) ? locations : []);
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
        fetchLocationsData();
    }, []);
    
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
                setLocalizaciones((prev) => [...prev, location]);
                setMessage("Localización creada exitosamente.");
                setNewName("");
                setNewImage(null);
                setShowForm(false);
            } else {
                setMessage("Error al crear la localización.");
            }
        } catch (error) {
            console.error("Error al enviar localización:", error);
            setMessage("Error de red al crear la localización.");
        }
    };

    return (
        <div className="w-full px-4 md:px-8 lg:px-16 py-6">
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

            {loading ? (
                <div className="flex flex-col items-center justify-center h-60 w-full">
                    <Loader />
                </div>
            ) : localizaciones.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-60 text-gray-500 w-full">
                    <img
                        src="/globe.svg"
                        alt="Sin localizaciones"
                        className="w-28 h-28 mb-2"
                        style={{ objectFit: "contain" }}
                    />
                    <span>No hay localizaciones actualmente</span>
                </div>
            ) : (
                <table className="min-w-full bg-white mx-auto border border-gray-300 rounded-lg shadow-lg overflow-hidden">
                    <thead className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 uppercase text-sm tracking-wider">
                        <tr>
                            <th className="px-4 py-3 text-left">Imagen</th>
                            <th className="px-4 py-3 text-left">Nombre</th>
                            <th className="px-4 py-3 text-left">ID</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                    {localizaciones
                        .filter(loc => search === "" || loc.name.toLowerCase().includes(search.toLowerCase()))
                        .map((localizacion) => (
                        <tr key={localizacion.id} className="hover:bg-gray-50 transition-colors duration-200" onClick={() => router.push(`/localizacion/${localizacion.id}`)}>
                            <td className="px-4 py-3">
                                {localizacion.image ? (
                                    <img
                                    src={`data:image/png;base64,${localizacion.image}`}
                                    alt={`Imagen de ${localizacion.name}`}
                                    className="w-10 h-10 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-10 h-10 bg-gray-200 rounded-full" />
                                )}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-800 font-medium">{localizacion.name}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{localizacion.id}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default LocalizacionesPage;