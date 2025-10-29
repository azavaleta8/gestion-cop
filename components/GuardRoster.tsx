'use client';

import React, { useState, useEffect } from 'react';

type DutyStaff = { id?: number; name: string };
type Duty = {
  id: number;
  assignedStaff: DutyStaff;
  actualStaff?: DutyStaff | null;
  location: { name: string };
  rol: { name: string };
};

// Helper function to get the nearest Wednesday
const getNearestWednesday = () => {
    const today = new Date();
    const day = today.getDay(); // Sunday = 0, Wednesday = 3
    const diff = day - 3; // Difference from Wednesday
    today.setDate(today.getDate() - diff);
    return today;
};

const GuardRoster = () => {
  const [duties, setDuties] = useState<Duty[]>([]);
  const [currentDate, setCurrentDate] = useState<Date>(getNearestWednesday());
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState<{id: number, name: string}[]>([]);
  const [selectedLocation, setSelectedLocation] = useState('');

  useEffect(() => {
    const fetchLocations = async () => {
        try {
            const response = await fetch('/api/locations');
            if(response.ok) {
                const data = await response.json();
                setLocations(Array.isArray(data.locations) ? data.locations : []);
            }
        } catch (error) {
            console.error('Error fetching locations:', error);
        }
    };
    fetchLocations();
  }, []);

  const fetchDuties = async (date: Date, locationId?: string) => {
    setLoading(true);
    const dateString = date.toISOString().split('T')[0];
    let url = `/api/guards?date=${dateString}`;
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

  const handlePrevDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  return (
    <div className="bg-white p-4 rounded-md shadow-md">
      <div className="flex justify-between items-center mb-4">
        <button onClick={handlePrevDay} className="px-4 py-2 bg-gray-300 rounded-md">
          Día Anterior
        </button>
        <h2 className="text-xl font-semibold">
          {currentDate.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </h2>
        <button onClick={handleNextDay} className="px-4 py-2 bg-gray-300 rounded-md">
          Día Siguiente
        </button>
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
        <div className="flex flex-col gap-4">
          {(duties || []).length > 0 ? (
            (duties || []).map((duty) => (
              <div key={duty.id} className="p-4 border rounded-md bg-gray-50 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                <p><strong>Funcionario Asignado:</strong> {duty.assignedStaff.name}</p>
                <p><strong>Funcionario Real:</strong> {duty.actualStaff ? duty.actualStaff.name : 'N/A'}</p>
                <p><strong>Ubicación:</strong> {duty.location.name}</p>
                <p><strong>Rol:</strong> {duty.rol.name}</p>
              </div>
            ))
          ) : (
            <p className="text-center py-8">No hay guardias asignadas para este día.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default GuardRoster;
