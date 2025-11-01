import React from 'react';
import { ChevronDoubleUpIcon } from "@heroicons/react/24/outline";

interface Rol {
  id?: number;
  name?: string;
}

interface StaffHeaderProps {
  staff: {
    name: string;
    image?: string | null;
    rol?: Rol | null;
  };
}

const StaffProfileHeader: React.FC<StaffHeaderProps> = ({ staff }) => {
  return (
    <div className="flex flex-col items-center gap-4 mb-6">
      <div className="relative">
        {staff.image ? (
          <div className="relative">
            <img
              src={`data:image/png;base64,${staff.image}`}
              alt={staff.name}
              className="w-36 h-36 rounded-full object-cover shadow-md border-4 border-white"
            />
            <div className="absolute inset-0 rounded-full border-2 border-gray-200"></div>
          </div>
        ) : (
          <div className="w-36 h-36 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-5xl shadow-md border-4 border-white">
            👤
          </div>
        )}
      </div>

      <h1 className="text-3xl font-bold text-gray-900">{staff.name}</h1>
    </div>
  );
};

export default StaffProfileHeader;
