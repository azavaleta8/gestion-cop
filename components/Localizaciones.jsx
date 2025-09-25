"use client";

import {
  Card,
  Input,
} from "@heroui/react";
import { useState, useEffect } from "react";
import Loader from "@/components/Loader";
import LocalizacionCard from "@/components/LocalizacionCard";


const Localizaciones = () => {
    const [localizaciones, setLocalizaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    // Obtener localizaciones con filtros
    // Agregar la llamada a la api para obtener las localizaciones
    /*useEffect(() => {
        setLoading(true);

        fetch(`/api/localizaciones`)
        .then((res) => res.json())
        .then((data) => setLocalizaciones(data.localizaciones || []))
        .finally(() => setLoading(false));
    }, [search, category, priceMin, priceMax, sortBy, order]);*/
    useEffect(() => {
        setLocalizaciones([{nombre: "Guarenas", id: 1}, {nombre: "Guatire", id: 2}, {nombre: "Guarenas", id: 3}, {nombre: "Guatire", id: 4}, {nombre: "Guarenas", id: 5}, {nombre: "Guatire", id: 6}]);
        setLoading(false);
    }, []);

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
            </Card>

            <div className="w-full">
                {loading ? (
                <div className="flex flex-col items-center justify-center h-60 w-full">
                    <Loader />
                </div>
                ) : localizaciones.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-60 text-gray-500 w-full">
                    <img
                    //src="/no-products.gif"
                    src="/glove.svg"
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
                            localizacion.nombre.toLowerCase().includes(search.toLowerCase())
                            ).length > 0 ? (
                                localizaciones.filter((localizacion) =>
                                    localizacion.nombre.toLowerCase().includes(search.toLowerCase())
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