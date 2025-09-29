"use client";

import {
  Card,
  Input,
} from "@heroui/react";
import { PlusIcon, PhotoIcon  } from "@heroicons/react/24/solid";
import { useState, useEffect } from "react";
import Loader from "@/components/Loader";
import LocalizacionCard from "@/components/LocalizacionCard";

const Localizaciones = () => {
    const [localizaciones, setLocalizaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [message, setMessage] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [newName, setNewName] = useState("");
    const [newImage, setNewImage] = useState(null);
    
    useEffect(() => {
        const fetchLocationsData = async () => {
            setLoading(true);
            try {
              const res = await fetch("/api/locations"); // Traemos todas las localizaciones
              if (res.ok) {
                const { localizaciones } = await res.json(); // Las pasamos a json
                if (localizaciones) {
                    setLocalizaciones(localizaciones);
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
    const fileToBase64 = file => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
    });

    // Maneja el envío del formulario para agregar una nueva localización
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newName || !newImage) {
            setMessage("Debes completar todos los campos.");
            return;
        }

        // Convierte la imagen a base64 para enviarla a la API
        const base64 = await fileToBase64(newImage);
        const imageData = base64.split(",")[1]; // elimina el encabezado data:image/png;base64,

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
        <div className="flex flex-col items-center gap-6">
            <Card className="p-4 w-[22rem] items-center gap-2">
                <h2 className="text-2xl font-bold mb-2">Localizaciones</h2>

                <Input
                label="Buscar localización"
                placeholder="Nombre"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-64"
                />
                
                {/* Botón para agregar nueva localización */}
                <button className={`mt-4 px-4 py-2 text-white rounded transition flex items-center gap-2 ${
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
                        </>)}
                </button>

                {showForm && (
                    // Formulario para agregar nueva localización
                    <form
                        onSubmit={handleSubmit}
                        className="mt-4 flex flex-col gap-4 w-full items-center"
                    >
                        <Input
                            label="Nombre de la localización"
                            placeholder="Ej. Plaza Bolívar"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
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
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Guardar localización
                        </button>
                    </form>
                )}
            </Card>

            <div className="w-full">
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
                <div className="flex flex-wrap justify-center gap-6 w-full">
                    {/* Muestra las localizaciones filtradas por búsqueda en caso de ingresar alguna ubicacion*/}
                    {search === "" ? (
                        localizaciones.map((localizacion) => (
                            <LocalizacionCard key={localizacion.id} localizacion={localizacion} />
                        ))
                    ) : (
                        localizaciones.filter((localizacion) =>
                            localizacion.name.toLowerCase().includes(search.toLowerCase())
                            ).length > 0 ? (
                                localizaciones.filter((localizacion) =>
                                    localizacion.name.toLowerCase().includes(search.toLowerCase())
                                ).map((localizacion) => (
                                    <LocalizacionCard key={localizacion.id} localizacion={localizacion} />
                                    ))
                                ) : (
                                    <p className="text-center text-gray-500 mt-4">
                                        No se encontró ninguna ubicación con ese nombre.
                                    </p>
                                )
                        )
                    }
                </div>
                )}
            </div>
        </div>
    );
};

export default Localizaciones;