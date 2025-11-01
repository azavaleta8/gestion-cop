"use client";

import React, { useEffect, useState } from "react";
import Modal from "@/components/Modal";
import StaffProfileHeader from "@/components/staff/StaffProfileHeader";
import StaffProfileInfo from "@/components/staff/StaffProfileInfo";
import StaffHistory from "@/components/staff/StaffHistory";
import { guardHistoryUrl } from '@/lib/consts';
import { getLastCompletedGuard } from '@/lib/date';

interface Rol {
  id: number;
  name: string;
}

interface StaffMember {
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
  assignedStaff?: StaffMember | null;
  actualStaff?: StaffMember | null;
  location?: { id: number; name: string } | null;
  rol?: Rol | null;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  encodedId: string | null; // base64 encoded staff id (same as current routing)
}

const StaffProfileModal: React.FC<Props> = ({ isOpen, onClose, encodedId }) => {
  const [staff, setStaff] = useState<StaffMember | null>(null);
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
      const { funcionario: staffMember } = await staffRes.json();
      setStaff(staffMember);

      if (staffMember && staffMember.dni) {
        const historyRes = await fetch(guardHistoryUrl(staffMember.dni, page, limit));
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

  const lastCompletedGuard = getLastCompletedGuard(duties);

  return (
  <Modal isOpen={isOpen} onClose={onClose} title="Perfil" size="4xl">
      <div className="space-y-4 max-h-[75vh] overflow-y-auto">
        {loading && <div>Cargando...</div>}

        {!loading && staff && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {/* Sección PERFIL */}
            <div
              className="md:col-span-2 min-h-[400px] bg-gradient-to-br
                from-white to-gray-50 rounded-2xl p-6 shadow-xl border
                border-gray-100">
              {/* Header (desacoplado) */}
              <StaffProfileHeader staff={staff} />

              {/* Información (desacoplada) */}
              <StaffProfileInfo staff={staff}
              lastCompletedGuard={lastCompletedGuard} />
            </div>

            {/* Sección HISTORIAL */}
            <div className="md:col-span-3">
              <StaffHistory duties={duties} page={page} totalPages={totalPages}
              setPage={setPage} />
            </div>
          </div>
        )}

        {!loading && !staff && <div>No se encontró el funcionario.</div>}
      </div>
    </Modal>
  );
};

export default StaffProfileModal;
