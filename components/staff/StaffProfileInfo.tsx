import React from 'react';
import {
  IdentificationIcon,
  PhoneIcon,
  ChevronDoubleUpIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

import { formatDateShort } from '@/lib/date';

interface StaffInfoProps {
  staff: {
    dni: string;
    phone?: string | null;
    rol?: { name?: string } | null;
    total_assignments?: number;
  };
  lastCompletedGuard: string | null;
}

const StaffProfileInfo: React.FC<StaffInfoProps> = ({ staff, lastCompletedGuard }) => {
  return (
    <div className="w-full">
      <div className="space-y-3 text-gray-900">
        <div className="flex items-center gap-3">
          <IdentificationIcon className="w-5 h-5 text-gray-600 flex-shrink-0" />
          <span className="text-lg text-gray-600">Cédula:</span>
          <span className="ml-2 text-lg font-medium">{staff.dni}</span>
        </div>

        <div className="flex items-center gap-3">
          <PhoneIcon className="w-5 h-5 text-gray-600 flex-shrink-0" />
          <span className="text-lg text-gray-600">Teléfono:</span>
          <span className="ml-2 text-lg font-medium">{staff.phone ?? '—'}</span>
        </div>

        <div className="flex items-center gap-3">
          <ChevronDoubleUpIcon className="w-5 h-5 text-gray-600 flex-shrink-0" />
          <span className="text-lg text-gray-600">Rango:</span>
          <span className="ml-2 text-lg font-medium">{staff.rol?.name ?? '—'}</span>
        </div>

        <div className="flex items-center gap-3">
          <ClipboardDocumentListIcon className="w-5 h-5 text-gray-600 flex-shrink-0" />
          <span className="text-lg text-gray-600">Servicios Realizados:</span>
          <span className="ml-2 text-lg font-medium">{staff.total_assignments ?? 0}</span>
        </div>

        <div className="flex items-center gap-3">
          <ClockIcon className="w-5 h-5 text-gray-600 flex-shrink-0" />
          <span className="text-lg text-gray-600">Última guardia:</span>
          <span className="ml-2 text-lg font-medium font-mono">{formatDateShort(lastCompletedGuard)}</span>
        </div>
      </div>
    </div>
  );
};

export default StaffProfileInfo;
