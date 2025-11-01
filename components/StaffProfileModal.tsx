"use client";

import React, { useEffect, useState } from "react";
import Modal from "@/components/Modal";
import StaffProfileHeader from "@/components/StaffProfileHeader";
import StaffProfileInfo from "@/components/StaffProfileInfo";
import StaffHistory from "@/components/StaffHistory";
import { formatDate, getTimeAgo } from '@/lib/date';

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

  // date formatting and relative helpers are provided by lib/date

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

  // Función para obtener la última guardia realizada (fecha en el pasado o hoy)
  const getLastCompletedGuard = () => {
    if (!duties || duties.length === 0) return null;
    
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Comparar solo fechas sin horas
    
    // Buscar la primera guardia cuya fecha sea <= hoy
    for (const duty of duties) {
      if (!duty.assignedDate) continue;
      const dutyDate = new Date(duty.assignedDate);
      dutyDate.setHours(0, 0, 0, 0);
      
      if (dutyDate <= now) {
        return duty.assignedDate;
      }
    }
    
    return null;
  };

  const lastCompletedGuard = getLastCompletedGuard();

  return (
  <Modal isOpen={isOpen} onClose={onClose} title="Perfil" size="4xl">
      <div className="space-y-4 max-h-[75vh] overflow-y-auto">
        {loading && <div>Cargando...</div>}

        {!loading && staff && (
          <div className="grid grid-cols-2 gap-6">
            {/* Sección PERFIL */}
            <div
              className="min-h-[400px] bg-gradient-to-br from-white
                to-gray-50 rounded-2xl p-6 shadow-xl border border-gray-100">
              {/* Header (desacoplado) */}
              <StaffProfileHeader staff={staff} />

              {/* Información (desacoplada) */}
              <StaffProfileInfo staff={staff} lastCompletedGuard={lastCompletedGuard} />
            </div>

            {/* Sección HISTORIAL */}
              <div>
                <StaffHistory duties={duties} page={page} totalPages={totalPages} setPage={setPage} />
              </div>
          </div>
        )}

        {!loading && !staff && <div>No se encontró el funcionario.</div>}
      </div>
    </Modal>
  );
};

export default StaffProfileModal;
