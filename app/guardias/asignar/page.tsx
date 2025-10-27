'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from '../../../components/Sidebar';

const AsignarGuardiaPage = () => {
  const [locations, setLocations] = useState<{id: number, name: string}[]>([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [assignments, setAssignments] = useState<{date: Date, staffId: string | null}[]>([]);
  const [staff, setStaff] = useState<{id: number, name: string, dni: string, rolId: number, rol: {name: string}}[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch('/api/locations');
        if (response.ok) {
          const data = await response.json();
          setLocations(data.locations || []);
        }
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    };
    fetchLocations();
  }, []);

  useEffect(() => {
    const fetchStaff = async () => {
        try {
            const response = await fetch('/api/users');
            if(response.ok) {
                const data = await response.json();
                setStaff(data.users || []);
            }
        } catch (error) {
            console.error('Error fetching staff:', error);
        }
    };
    fetchStaff();
  }, []);

  const weekOptions = useMemo(() => {
    const date = currentDate;
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const weeks = [];
    let currentWeekStart = new Date(firstDayOfMonth);
    
    currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay());

    while (currentWeekStart <= lastDayOfMonth) {
      const weekEnd = new Date(currentWeekStart);
      weekEnd.setDate(currentWeekStart.getDate() + 6);
      weeks.push({
        label: `${currentWeekStart.toLocaleDateString('es-ES')} - ${weekEnd.toLocaleDateString('es-ES')}`,
        start: new Date(currentWeekStart),
      });
      currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    }
    return weeks;
  }, [currentDate]);

  useEffect(() => {
    if (weekOptions.length > 0) {
      handleWeekChange(weekOptions[0].start.toISOString());
    } else {
      setAssignments([]);
    }
  }, [weekOptions]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  
  const handleWeekChange = (weekStartISO: string) => {
    if (weekStartISO) {
      const startDate = new Date(weekStartISO);
      const newAssignments = Array(7).fill(null).map((_, i) => {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        return { date, staffId: null };
      });
      setAssignments(newAssignments);
    } else {
      setAssignments([]);
    }
  };

  const handleAssignStaff = (dayIndex: number, staffId: string) => {
    const newAssignments = [...assignments];
    newAssignments[dayIndex].staffId = staffId;
    setAssignments(newAssignments);
  };
  
  const filteredStaff = searchTerm
    ? staff.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        s.dni.includes(searchTerm)
      )
    : staff;

  const handleSaveWeek = async () => {
    const dutiesToCreate = assignments
        .filter(a => a.staffId)
        .map(a => {
            const staffMember = staff.find(s => s.id === parseInt(a.staffId!));
            if (!staffMember) return null;
            return {
                assignedDate: a.date,
                assignedStaffId: parseInt(a.staffId!),
                locationId: parseInt(selectedLocation),
                rolId: staffMember.rolId,
            };
        })
        .filter(Boolean); // Filter out nulls
    
    try {
        await Promise.all(dutiesToCreate.map(duty => 
            fetch('/api/guards', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(duty),
            })
        ));
        alert('Guardias asignadas con éxito!');
    } catch (error) {
        console.error('Error saving week:', error);
        alert('Error al guardar las guardias.');
    }
  };
  
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col p-4">
        <h1 className="text-2xl font-bold mb-4">Asignar Guardia Semanal</h1>

        <div className="flex gap-4 mb-4 items-end">
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700">Ubicación</label>
            <select
              id="location"
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="mt-1 p-2 border rounded-md bg-white shadow-sm"
            >
              <option value="">Seleccione una ubicación</option>
              {locations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Mes</label>
            <div className="flex items-center gap-2 mt-1">
              <button onClick={handlePrevMonth} className="px-2 py-1 bg-gray-200 rounded-md">&lt;</button>
              <span className="p-1 min-w-[150px] text-center">{currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}</span>
              <button onClick={handleNextMonth} className="px-2 py-1 bg-gray-200 rounded-md">&gt;</button>
            </div>
          </div>
          <div>
            <label htmlFor="week" className="block text-sm font-medium text-gray-700">Semana</label>
            <select
              id="week"
              onChange={(e) => handleWeekChange(e.target.value)}
              className="mt-1 p-2 border rounded-md bg-white shadow-sm"
              disabled={!selectedLocation}
            >
              {weekOptions.map(week => <option key={week.label} value={week.start.toISOString()}>{week.label}</option>)}
            </select>
          </div>
        </div>
        
        {selectedLocation && (
          <div>
            <div className="mb-4">
              <input 
                type="text"
                placeholder="Buscar funcionario por nombre o DNI..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="p-2 border rounded-md w-full"
              />
            </div>
            <div className="flex flex-col gap-4">
              {assignments.map((assignment, index) => (
                <div key={index} className="p-4 border rounded-md bg-gray-50 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold">{new Date(assignment.date).toLocaleDateString('es-ES', { weekday: 'long' })}</h3>
                    <p className="text-sm">{new Date(assignment.date).toLocaleDateString('es-ES')}</p>
                  </div>
                  <div className="w-1/3">
                    <select 
                      value={assignment.staffId || ''}
                      onChange={(e) => handleAssignStaff(index, e.target.value)}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="">Asignar...</option>
                      {filteredStaff.map(s => (
                          <option key={s.id} value={s.id}>{s.name} ({s.rol.name})</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={handleSaveWeek} className="mt-4 px-4 py-2 bg-green-500 text-white rounded-md">
              Guardar Semana
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AsignarGuardiaPage;
