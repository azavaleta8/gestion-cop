import React from 'react';

interface Props {
  location: {
    id: number;
    name: string;
    image?: string | null;
  } | null;
}

const LocationProfileHeader: React.FC<Props> = ({ location }) => {
  if (!location) return null;

  return (
    <div className="flex flex-col items-center gap-2 mb-4">
      <div className="relative">
        {location.image ? (
          <div className="relative">
            <img
              src={`data:image/png;base64,${location.image}`}
              alt={location.name}
              className="w-36 h-36 rounded-full object-cover shadow-md border-4 border-white"
            />
            <div className="absolute inset-0 rounded-full border-2 border-gray-200"></div>
          </div>
        ) : (
          <div className="w-36 h-36 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-5xl shadow-md border-4 border-white">
            📍
          </div>
        )}
      </div>

      <h1 className="text-xl font-bold text-gray-900">{location.name}</h1>
    </div>
  );
};

export default LocationProfileHeader;
