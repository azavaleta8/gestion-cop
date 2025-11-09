'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import AssignGuardModal from '@/components/AssignGuardModal';
import { UserCircleIcon, MapPinIcon, DevicePhoneMobileIcon, IdentificationIcon, PlusCircleIcon, TrashIcon, PencilIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css'

// Helper to get the start of the week (Tuesday)
const getStartOfWeek = (date: Date) => {
  const newDate = new Date(date);
  const day = newDate.getDay(); // 0 for Sunday, 1 for Monday, 2 for Tuesday...
  const diff = (day - 2 + 7) % 7; // 2 is for Tuesday
  newDate.setDate(newDate.getDate() - diff);
  newDate.setHours(0, 0, 0, 0); // Set to the beginning of the day
  return newDate;
};

interface Location {
    id: number;
    name: string;
}

interface Rol {
    id: number;
    name: string;
}

interface Staff {
    id: number;
    name: string;
    dni: string;
    rol: Rol;
    image?: string;
    phone?: string;
}

interface Guard {
    id: number;
    date: Date;
    staff: Staff;
    location: Location;
}

interface DailyAssignments {
    date: Date;
    guards: Guard[];
}

const GuardiasPage = () => {
  const [currentWeekStart, setCurrentWeekStart] = useState(getStartOfWeek(new Date()));
  const [assignments, setAssignments] = useState<DailyAssignments[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingGuard, setEditingGuard] = useState<Guard | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);



  const fetchGuardsForWeek = useCallback(async () => {
    const startDate = new Date(currentWeekStart);
    startDate.setHours(0, 0, 0, 0); // Asegura que la consulta empiece al inicio del día
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999); // Asegura que cubra todo el último día

    try {
      const response = await fetch(`/api/guards?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`);
      type APIGuard = { id: number; assignedDate: string; assignedStaff: Staff; location: Location };
      const { guards: existingGuards } = (await response.json()) as { guards: APIGuard[] };

      const dailyAssignmentsMap = new Map<string, Guard[]>();

      existingGuards.forEach((g: APIGuard) => {
        const dateString = g.assignedDate.split('T')[0];
        const guardDate = new Date(dateString + 'T00:00:00');
        
        if (!dailyAssignmentsMap.has(dateString)) {
          dailyAssignmentsMap.set(dateString, []);
        }
        dailyAssignmentsMap.get(dateString)!.push({
            id: g.id,
            date: guardDate,
            staff: g.assignedStaff,
            location: g.location,
        });
      });

      const newAssignments: DailyAssignments[] = Array(7).fill(null).map((_, i) => {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        
        // Build date string manually to avoid timezone conversion from toISOString()
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const dateString = `${year}-${month}-${day}`;

        return {
          date,
          guards: dailyAssignmentsMap.get(dateString) || [],
        };
      });

      setAssignments(newAssignments);
    } catch (error) {
      console.error("Error fetching guards for week:", error);
      // Initialize with empty guards array
      const newAssignments = Array(7).fill(null).map((_, i) => {
          const date = new Date(startDate);
          date.setDate(startDate.getDate() + i);
          return { date, guards: [] };
      });
      setAssignments(newAssignments);
      }
    }, [currentWeekStart]);

  useEffect(() => {
    fetchGuardsForWeek();
  }, [fetchGuardsForWeek]);

  const handlePrevWeek = () => {
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(newWeekStart.getDate() - 7);
    setCurrentWeekStart(newWeekStart);
  };

  const handleNextWeek = () => {
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(newWeekStart.getDate() + 7);
    setCurrentWeekStart(newWeekStart);
  };

  const handleExportWeek = async () => {
    // Build YYYY-MM-DD for currentWeekStart (avoid timezone issues)
    const y = currentWeekStart.getFullYear();
    const m = String(currentWeekStart.getMonth() + 1).padStart(2, '0');
    const d = String(currentWeekStart.getDate()).padStart(2, '0');
    const start = `${y}-${m}-${d}`;
    try {
      const res = await fetch(`/api/guards/export/week?start=${start}`);
      if (!res.ok) throw new Error('No se pudo exportar');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `guardias_semana_${start}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert('Error al exportar la semana a Excel');
    }
  };

  const openCreateModal = (date: Date) => {
    setSelectedDate(date);
    setEditingGuard(null);
    setModalOpen(true);
  };

  const openEditModal = (guard: Guard) => {
    setSelectedDate(guard.date);
    setEditingGuard(guard);
    setModalOpen(true);
  };

  const handleSaveAssignment = async (staff: Staff, location: Location) => {
    if (!selectedDate) return;

    const body = {
      assignedDate: selectedDate,
      assignedStaffId: staff.id,
      locationId: location.id,
      rolId: staff.rol.id,
    };

    const url = editingGuard ? `/api/guards/${editingGuard.id}` : '/api/guards';
    const method = editingGuard ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error('Failed to save assignment');
      
      fetchGuardsForWeek(); // Refresh data
      setModalOpen(false);
    } catch (error) {
      console.error('Error saving assignment:', error);
      alert('Error al guardar la asignación.');
    }
  };

  const handleDeleteAssignment = async (guardId: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta asignación?')) return;

    try {
        const response = await fetch(`/api/guards/${guardId}`, {
            method: 'DELETE',
        });

        if (!response.ok) throw new Error('Failed to delete assignment');

        fetchGuardsForWeek(); // Refresh data
    } catch (error) {
        console.error('Error deleting assignment:', error);
        alert('Error al eliminar la asignación.');
    }
  };

  /* const getWeekDisplay = () => {
    const start = new Date(currentWeekStart);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    const startMonth = start.toLocaleString('es-ES', { month: 'long' });
    const endMonth = end.toLocaleString('es-ES', { month: 'long' });
    const monthDisplay = startMonth === endMonth ? startMonth : `${startMonth} / ${endMonth}`;
    return `${start.getDate()} de ${monthDisplay.charAt(0).toUpperCase() + monthDisplay.slice(1)} - ${end.getDate()} de ${endMonth.charAt(0).toUpperCase() + endMonth.slice(1)}`;
  }; */

  const getWeekDisplay = () => {
    const start = new Date(currentWeekStart);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    
    const formatDate = (date: Date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = String(date.getFullYear()).slice(-2);
        return `${day}/${month}/${year}`;
    };
    
    return `${formatDate(start)} - ${formatDate(end)}`;
};

  return (
    <div className="w-full px-4 md:px-8 lg:px-16 py-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Gestión de Guardias</h1>
          <div className="flex items-center w-[400px] gap-2 p-2 bg-white rounded-lg shadow-sm">
            <button onClick={handlePrevWeek} className="p-2 rounded-md hover:bg-gray-100 text-gray-600 hover:rounded-full hover:cursor-pointer text-blue-800 font-semibold">&lt;</button>
            <div className="text-center font-mono font-semibold text-blue-800 w-[180px]">{getWeekDisplay()}</div>
            <button onClick={handleNextWeek} className="p-2 rounded-md hover:bg-gray-100 text-gray-600 hover:cursor-pointer hover:rounded-full text-blue-800 font-semibold">&gt;</button>
            <button
              onClick={handleExportWeek}
              data-tooltip-id='my-tooltip'
              data-tooltip-content={"Descargar información en formato excel"}
              data-tooltip-delay-show={200}
              className="ml-4 w-[120px] flex gap-1 px-3 py-2 bg-green-600 text-white rounded-md font-semibold hover:cursor-pointer hover:bg-green-700">
              <ArrowDownTrayIcon className="w-5 h-5" />
              Exportar
              </button>
          </div>
        </div>

        <div className="space-y-6">
          {assignments.map((dailyAssignment, index) => (
            <div key={index} className="p-6 border rounded-lg bg-white shadow-md transition-shadow hover:shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="font-bold text-xl text-gray-800 capitalize">{new Date(dailyAssignment.date).toLocaleDateString('es-ES', { weekday: 'long' })}</h3>
                  <p className="text-sm text-gray-500">{new Date(dailyAssignment.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                </div>
                <button
                  data-tooltip-id='guard-button'
                  data-tooltip-content={"Asignar nueva guardia"}
                  data-tooltip-delay-show={200}
                  onClick={() => openCreateModal(dailyAssignment.date)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg
                    font-semibold hover:bg-blue-700 flex items-center 
                    gap-2 hover:cursor-pointer">
                  <PlusCircleIcon className="w-5 h-5" />
                  Asignar
                </button>
              </div>
              
              <div className="space-y-4">
                {dailyAssignment.guards.length > 0 ? (
                  dailyAssignment.guards.map(guard => (
                    <div key={guard.id} className="w-full grid grid-cols-1 md:grid-cols-5 items-center gap-4 bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center justify-center md:justify-start">
            {guard.staff.image ? (
              <Image
                src={`data:image/png;base64,${guard.staff.image}`}
                alt={guard.staff.name}
                width={48}
                height={48}
                className="w-12 h-12 rounded-full object-cover"
                unoptimized
              />
            ) : (
              <UserCircleIcon className="w-12 h-12 text-gray-400" />
            )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{guard.staff.name}</p>
                        <p className="text-sm text-gray-600">{guard.staff.rol.name}</p>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 text-sm text-gray-500"><IdentificationIcon className="w-4 h-4" /><span>{guard.staff.dni}</span></div>
                        {guard.staff.phone && <div className="flex items-center gap-2 text-sm text-gray-500"><DevicePhoneMobileIcon className="w-4 h-4" /><span>{guard.staff.phone}</span></div>}
                      </div>
                      <div className="flex items-center gap-2 text-gray-700"><MapPinIcon className="w-5 h-5" /><p className="font-medium">{guard.location.name}</p></div>
                      <div className="flex justify-center md:justify-end items-center gap-2">
                        <button onClick={() => openEditModal(guard)} className="p-2 text-yellow-600 hover:text-yellow-800"><PencilIcon className="w-5 h-5" /></button>
                        <button onClick={() => handleDeleteAssignment(guard.id)} className="p-2 text-red-600 hover:text-red-800"><TrashIcon className="w-5 h-5" /></button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-4">No hay guardias asignadas para este día.</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>


      <Tooltip 
        id="my-tooltip" 
        place="bottom"
        variant="info"
      />
      <Tooltip 
        id="guard-button" 
        place="bottom"
        variant="info"
      />

      {(isModalOpen && selectedDate) && (
        <AssignGuardModal
          isOpen={isModalOpen}
          onClose={() => setModalOpen(false)}
          onSave={handleSaveAssignment}
          date={selectedDate}
          // initialData={editingGuard} // This would be an enhancement for the modal
        />
      )}
    </div>
  );
};

export default GuardiasPage;
