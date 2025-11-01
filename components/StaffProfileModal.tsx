"use client";

import React, { useEffect, useState } from "react";
import Modal from "@/components/Modal";

interface Rol {
  id: number;
  name: string;
}

interface Funcionario {
  id: number;
  name: string;
  dni: string;
  phone?: string;
  rol?: Rol;
  image?: string | null;
  total_assignments?: number;
  last_guard?: string | null;
}

interface GuardDuty {
  id: number;
  assignedDate: string | null;
  startTime?: string | null;
  endTime?: string | null;
  assignedStaff?: Funcionario | null;
  actualStaff?: Funcionario | null;
  location?: { id: number; name: string } | null;
  rol?: Rol | null;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  encodedId: string | null; // base64 encoded staff id (same as current routing)
}

const StaffProfileModal: React.FC<Props> = ({ isOpen, onClose, encodedId }) => {
  const [staff, setStaff] = useState<Funcionario | null>(null);
  const [duties, setDuties] = useState<GuardDuty[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(8);
  const [total, setTotal] = useState(0);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    const days = ['DOM', 'LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB'];
    const day = days[date.getDay()];
    const dayNum = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day} - ${dayNum}/${month}/${year}`;
  };

  const getTimeAgo = (dateString: string | null) => {
    if (!dateString) return '—';
    
    const now = new Date();
    const assignedDate = new Date(dateString);
    const diffInMs = now.getTime() - assignedDate.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    // Fechas futuras (números negativos)
    if (diffInDays < 0) {
      const absDays = Math.abs(diffInDays);
      // Menos de 7 días en el futuro: mostrar días
      if (absDays < 7) {
        return absDays === 1 ? 'Dentro de 1 día' : `Dentro de ${absDays} días`;
      }
      // 7 días o más pero menos de 30 días: mostrar semanas
      const weeks = Math.floor(absDays / 7);
      if (absDays < 30) {
        return weeks === 1 ? 'Dentro de 1 semana' : `Dentro de ${weeks} semanas`;
      }
      // 30 días o más pero menos de 365 días: mostrar meses
      const months = Math.floor(absDays / 30);
      if (absDays < 365) {
        return months === 1 ? 'Dentro de 1 mes' : `Dentro de ${months} meses`;
      }
      // 365 días o más: mostrar años
      const years = Math.floor(absDays / 365);
      return years === 1 ? 'Dentro de 1 año' : `Dentro de ${years} años`;
    }
    
    // Caso especial: hoy (0 días)
    if (diffInDays === 0) {
      return 'Hoy';
    }
    
    // Menos de 7 días: mostrar días
    if (diffInDays < 7) {
      return diffInDays === 1 ? 'Hace 1 día' : `Hace ${diffInDays} días`;
    }
    
    // 7 días o más pero menos de 30 días: mostrar semanas
    const weeks = Math.floor(diffInDays / 7);
    if (diffInDays < 30) {
      return weeks === 1 ? 'Hace 1 semana' : `Hace ${weeks} semanas`;
    }
    
    // 30 días o más pero menos de 365 días (12 meses): mostrar meses
    const months = Math.floor(diffInDays / 30);
    if (diffInDays < 365) {
      return months === 1 ? 'Hace 1 mes' : `Hace ${months} meses`;
    }
    
    // 365 días o más (12 meses o más): mostrar años
    const years = Math.floor(diffInDays / 365);
    return years === 1 ? 'Hace 1 año' : `Hace ${years} años`;
  };

  const fetchData = async () => {
    if (!encodedId) return;
    setLoading(true);
    try {
      // fetch staff by encoded id
      const staffRes = await fetch(`/api/users/${encodedId}`);
      if (!staffRes.ok) {
        setStaff(null);
        setDuties([]);
        setTotal(0);
        return;
      }
      const { funcionario } = await staffRes.json();
      setStaff(funcionario);

      if (funcionario && funcionario.dni) {
        const historyRes = await fetch(`/api/guards/history/${encodeURIComponent(funcionario.dni)}?page=${page}&limit=${limit}&sortBy=assignedDate&sortDir=desc`);
        if (historyRes.ok) {
          const json = await historyRes.json();
          setDuties(Array.isArray(json.duties) ? json.duties : []);
          setTotal(typeof json.total === 'number' ? json.total : 0);
        } else {
          setDuties([]);
          setTotal(0);
        }
      }
    } catch (error) {
      console.error("Error fetching staff/profile data", error);
      setStaff(null);
      setDuties([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, encodedId, page]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={staff ? `Perfil — ${staff.name}` : "Perfil"} size="xl">
      <div className="space-y-4">
        {loading && <div>Cargando...</div>}

        {!loading && staff && (
          <div>
            <div className="flex gap-4 items-center mb-4">
              {staff.image ? (
                <img src={`data:image/png;base64,${staff.image}`} alt={staff.name} className="w-16 h-16 rounded-full object-cover" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">👤</div>
              )}
              <div>
                <div className="text-lg font-semibold">{staff.name}</div>
                <div className="text-sm text-gray-600">Cédula: {staff.dni}</div>
                <div className="text-sm text-gray-600">Teléfono: {staff.phone ?? '—'}</div>
                <div className="text-sm text-gray-600">Cargo: {staff.rol?.name ?? '—'}</div>
                <div className="text-sm text-gray-600">Asignaciones: {staff.total_assignments ?? 0}</div>
                <div className="text-sm text-gray-600">Última guardia: <span className="font-mono">{formatDate(staff.last_guard ?? null)}</span></div>
              </div>
            </div>

            <h4 className="font-semibold mb-2">Historial de guardias</h4>
            {duties.length === 0 ? (
              <div className="text-sm text-gray-600">No hay guardias registradas para este funcionario.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm table-auto">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="py-2 font-mono">Fecha</th>
                      <th className="py-2">Tiempo</th>
                      <th className="py-2">Ubicación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {duties.map((d) => (
                      <tr key={d.id} className="border-b">
                        <td className="py-2 font-mono">{formatDate(d.assignedDate)}</td>
                        <td className="py-2">{getTimeAgo(d.assignedDate)}</td>
                        <td className="py-2">{d.location?.name ?? '—'}</td>
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

        {!loading && !staff && <div>No se encontró el funcionario.</div>}
      </div>
    </Modal>
  );
};

export default StaffProfileModal;
