"use client";

import React, { useEffect, useState } from "react";
import Modal from "@/components/Modal";
import LocationProfileHeader from '@/components/location/LocationProfileHeader';
import LocationProfileInfo from '@/components/location/LocationProfileInfo';
import LocationHistory from '@/components/location/LocationHistory';
import { guardHistoryByLocationUrl } from '@/lib/consts';
import { getLastCompletedGuard } from '@/lib/date';

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

      // use centralised URL builder for location history
      const historyRes = await fetch(guardHistoryByLocationUrl(locationId, page, limit));
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

  const lastCompletedGuard = getLastCompletedGuard(duties);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Servicio" size="4xl">
      <div className="space-y-4 max-h-[77vh] overflow-y-auto">
        {loading && <div>Cargando...</div>}

        {!loading && location && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {/* PROFILE */}
            <div className="md:col-span-2 min-h-[400px] bg-gradient-to-br
                from-white to-gray-50 rounded-2xl p-3 shadow-md border
                border-gray-100">
              <LocationProfileHeader
                location={location} />
              <LocationProfileInfo
                location={location}
                lastCompletedGuard={lastCompletedGuard} />
            </div>

            {/* HISTORY */}
            <div className="md:col-span-3">
              <LocationHistory
                duties={duties}
                page={page}
                totalPages={totalPages}
                setPage={setPage} />
            </div>
          </div>
        )}

        {!loading && !location && <div>No se encontró el servicio.</div>}
      </div>
    </Modal>
  );
};

export default LocationProfileModal;
