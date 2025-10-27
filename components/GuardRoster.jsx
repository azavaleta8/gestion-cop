'use client';

import React, { useState, useEffect } from 'react';

const GuardRoster = () => {
  const [duties, setDuties] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');

  useEffect(() => {
    const fetchLocations = async () => {
        try {
            const response = await fetch('/api/locations');
            if(response.ok) {
                const data = await response.json();
                setLocations(data.locations);
            }
        } catch (error) {
            console.error('Error fetching locations:', error);
        }
    };
    fetchLocations();
  }, []);

  const fetchDuties = async (date, locationId) => {
    setLoading(true);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    let url = `/api/guards?month=${month}&year=${year}`;
    if (locationId) {
        url += `&locationId=${locationId}`;
    }

    try {
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setDuties(Array.isArray(data) ? data : []);
      } else {
        console.error('Error fetching duties:', response.statusText);
        setDuties([]);
      }
    } catch (error) {
      console.error('Error fetching duties:', error);
      setDuties([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDuties(currentDate, selectedLocation);
  }, [currentDate, selectedLocation]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  return (
    <div className="bg-white p-4 rounded-md shadow-md">
      <div className="flex justify-between items-center mb-4">
        <div>
            <button onClick={handlePrevMonth} className="px-4 py-2 bg-gray-300 rounded-md">
                Mes Anterior
            </button>
        </div>
        <h2 className="text-xl font-semibold">
          {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h2>
        <div>
            <button onClick={handleNextMonth} className="px-4 py-2 bg-gray-300 rounded-md">
                Mes Siguiente
            </button>
        </div>
      </div>

      <div className="mb-4">
        <label htmlFor="locationFilter" className="block text-sm font-medium text-gray-700">Filtrar por Ubicación</label>
        <select
            id="locationFilter"
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
            <option value="">Todas las ubicaciones</option>
            {(locations || []).map(location => (
                <option key={location.id} value={location.id}>{location.name}</option>
            ))}
        </select>
      </div>

      {loading ? (
        <p>Cargando guardias...</p>
      ) : (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Funcionario Asignado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Funcionario Real</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ubicación</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {(duties || []).length > 0 ? (
              (duties || []).map((duty) => (
                <tr key={duty.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{new Date(duty.assignedDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{duty.assignedStaff.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{duty.actualStaff ? duty.actualStaff.name : 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{duty.location.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{duty.rol.name}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center">No hay guardias asignadas para este mes.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default GuardRoster;
