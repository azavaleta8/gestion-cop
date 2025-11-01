import React from 'react';
import {
  ClipboardDocumentListIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { formatDateShort } from '@/lib/date';

interface Props {
  location: {
    id: number;
    name: string;
    total_assignments?: number;
    last_guard?: string | null;
  } | null;
  lastCompletedGuard?: string | null;
}

const LocationProfileInfo: React.FC<Props> = ({ location, lastCompletedGuard }) => {
  if (!location) return null;

  return (
    <div className='w-full'>
      <div className="space-y-3 text-gray-900">
        <div className="flex items-center gap-3">
          <ClipboardDocumentListIcon className="w-5 h-5 text-gray-600 flex-shrink-0" />
          <span className="text-lg text-gray-600">Servicios Recibidos:</span>
          <span className="ml-2 text-lg font-medium">{location.total_assignments ?? 0}</span>
        </div>

        <div className="flex items-center gap-3">
          <ClockIcon className="w-5 h-5 text-gray-600 flex-shrink-0" />
          <span className="text-lg text-gray-600">Última guardia:</span>
          <span className="ml-2 text-lg font-medium">{formatDateShort(lastCompletedGuard ?? location.last_guard ?? null)}</span>
        </div>
      </div>

    </div>
  );
};

export default LocationProfileInfo;
