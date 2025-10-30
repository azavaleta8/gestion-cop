"use client";

import React, { useEffect, useState } from "react";
import Modal from "@/components/Modal";

interface Rol { id: number; name: string }
interface Staff { id: number; name: string }

interface Location {
  id: number;
  name: string;
  image?: string | null;
  total_assignments?: number;
  last_guard?: string | null;
}

interface GuardDuty {
  id: number;
  assignedDate: string | null;
  assignedStaff?: Staff | null;
  actualStaff?: Staff | null;
  location?: { id: number; name: string } | null;
  rol?: Rol | null;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  locationId: number | null;
}

const LocationProfileModal: React.FC<Props> = ({ isOpen, onClose, locationId }) => {
  const [location, setLocation] = useState<Location | null>(null);
  const [duties, setDuties] = useState<GuardDuty[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(8);
  const [total, setTotal] = useState(0);

  const fetchData = async () => {
    if (!locationId) return;
    setLoading(true);
    try {
      const locRes = await fetch(`/api/locations/${locationId}`);
      if (!locRes.ok) {
        setLocation(null);
        setDuties([]);
        setTotal(0);
        return;
      }
      const { location } = await locRes.json();
      setLocation(location);

      const historyRes = await fetch(`/api/guards/history/location/${locationId}?page=${page}&limit=${limit}&sortBy=assignedDate&sortDir=desc`);
      if (historyRes.ok) {
        const json = await historyRes.json();
        setDuties(Array.isArray(json.duties) ? json.duties : []);
        setTotal(typeof json.total === 'number' ? json.total : 0);
      } else {
        setDuties([]);
        setTotal(0);
      }
    } catch (err) {
      console.error("Error fetching location/profile data", err);
      setLocation(null);
      setDuties([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, locationId, page]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={location ? `Servicio — ${location.name}` : "Servicio"} size="xl">
      <div className="space-y-4">
        {loading && <div>Cargando...</div>}

        {!loading && location && (
          <div>
            <div className="flex gap-4 items-center mb-4">
              {location.image ? (
                <img src={`data:image/png;base64,${location.image}`} alt={location.name} className="w-16 h-16 rounded-full object-cover" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">📍</div>
              )}
              <div>
                <div className="text-lg font-semibold">{location.name}</div>
                <div className="text-sm text-gray-600">Asignaciones: {location.total_assignments ?? 0}</div>
                <div className="text-sm text-gray-600">Última guardia: {location.last_guard ? location.last_guard : '—'}</div>
              </div>
            </div>

            <h4 className="font-semibold mb-2">Guardias registradas</h4>
            {duties.length === 0 ? (
              <div className="text-sm text-gray-600">No hay guardias registradas para este servicio.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm table-auto">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="py-2">Fecha</th>
                      <th className="py-2">Cargo</th>
                      <th className="py-2">Funcionario</th>
                    </tr>
                  </thead>
                  <tbody>
                    {duties.map((d) => (
                      <tr key={d.id} className="border-b">
                        <td className="py-2">{d.assignedDate ? new Date(d.assignedDate).toLocaleDateString('es-ES') : '—'}</td>
                        <td className="py-2">{d.rol?.name ?? '—'}</td>
                        <td className="py-2">{d.assignedStaff ? d.assignedStaff.name : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-600">Página {page} de {totalPages}</div>
              <div className="flex gap-2">
                <button
                  className="px-3 py-1 rounded bg-gray-200"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >Anterior</button>
                <button
                  className="px-3 py-1 rounded bg-gray-200"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                >Siguiente</button>
              </div>
            </div>
          </div>
        )}

        {!loading && !location && <div>No se encontró el servicio.</div>}
      </div>
    </Modal>
  );
};

export default LocationProfileModal;
