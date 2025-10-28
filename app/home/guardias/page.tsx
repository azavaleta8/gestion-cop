'use client';

import React, { useState, useEffect } from 'react';
import AssignGuardModal from '@/components/AssignGuardModal';
import { UserCircleIcon, CalendarIcon, MapPinIcon } from '@heroicons/react/24/outline';

// Helper to get the start of the week (Sunday)
const getStartOfWeek = (date: Date) => {
  const newDate = new Date(date);
  const day = newDate.getDay();
  const diff = newDate.getDate() - day;
  return new Date(newDate.setDate(diff));
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
}

interface Assignment {
    date: Date;
    staff: Staff | null;
    location: Location | null;
}

const GuardiasPage = () => {
  const [currentWeekStart, setCurrentWeekStart] = useState(getStartOfWeek(new Date()));
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const fetchGuardsForWeek = async () => {
    const startDate = new Date(currentWeekStart);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);

    try {
      const response = await fetch(`/api/guards?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`);
      const { guards: existingGuards } = await response.json();

      const newAssignments = Array(7).fill(null).map((_, i) => {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);

        const guardForDay = existingGuards.find((g: any) => {
          const guardDate = new Date(g.assignedDate);
          return guardDate.getUTCFullYear() === date.getUTCFullYear() &&
                 guardDate.getUTCMonth() === date.getUTCMonth() &&
                 guardDate.getUTCDate() === date.getUTCDate();
        });

        return {
          date,
          staff: guardForDay ? guardForDay.assignedStaff : null,
          location: guardForDay ? guardForDay.location : null,
        };
      });
      setAssignments(newAssignments);
    } catch (error) {
      console.error("Error fetching guards for week:", error);
      const newAssignments = Array(7).fill(null).map((_, i) => {
          const date = new Date(startDate);
          date.setDate(startDate.getDate() + i);
          return { date, staff: null, location: null };
      });
      setAssignments(newAssignments);
    }
  };

  useEffect(() => {
    fetchGuardsForWeek();
  }, [currentWeekStart]);

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

  const openAssignModal = (date: Date) => {
    setSelectedDate(date);
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

    try {
      const response = await fetch('/api/guards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error('Failed to save assignment');
      }

      // Refresh the week's data
      fetchGuardsForWeek();
      setModalOpen(false);
    } catch (error) {
      console.error('Error saving assignment:', error);
      alert('Error al guardar la asignación.');
    }
  };

  const getWeekDisplay = () => {
    const start = new Date(currentWeekStart);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    const startMonth = start.toLocaleString('es-ES', { month: 'long' });
    const endMonth = end.toLocaleString('es-ES', { month: 'long' });
    const monthDisplay = startMonth === endMonth ? startMonth : `${startMonth} / ${endMonth}`;
    return `${start.getDate()} de ${monthDisplay.charAt(0).toUpperCase() + monthDisplay.slice(1)} - ${end.getDate()} de ${endMonth.charAt(0).toUpperCase() + endMonth.slice(1)}`;
  };

  return (
    <div className="w-full px-4 md:px-8 lg:px-16 py-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Gestión de Guardias</h1>
          <div className="flex items-center gap-4 p-2 bg-white rounded-lg shadow-sm">
            <button onClick={handlePrevWeek} className="p-2 rounded-md hover:bg-gray-100 text-gray-600">&lt;</button>
            <div className="text-center font-semibold text-blue-600">
              {getWeekDisplay()}
            </div>
            <button onClick={handleNextWeek} className="p-2 rounded-md hover:bg-gray-100 text-gray-600">&gt;</button>
          </div>
        </div>

        <div className="space-y-6">
          {assignments.map((assignment, index) => (
            <div key={index} className="p-6 border rounded-lg bg-white shadow-md transition-shadow hover:shadow-lg">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div className="mb-4 md:mb-0">
                  <h3 className="font-bold text-xl text-gray-800 capitalize">{new Date(assignment.date).toLocaleDateString('es-ES', { weekday: 'long' })}</h3>
                  <p className="text-sm text-gray-500">{new Date(assignment.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                </div>
                
                {assignment.staff && assignment.location ? (
                  <div className="w-full md:w-auto flex flex-col md:flex-row md:items-center gap-6 bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-4">
                      {assignment.staff.image ? (
                          <img src={`data:image/png;base64,${assignment.staff.image}`} alt={assignment.staff.name} className="w-12 h-12 rounded-full object-cover" />
                      ) : (
                          <UserCircleIcon className="w-12 h-12 text-gray-400" />
                      )}
                      <div>
                          <p className="font-semibold text-gray-900">{assignment.staff.name}</p>
                          <p className="text-sm text-gray-600">{assignment.staff.rol.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                        <MapPinIcon className="w-5 h-5" />
                        <p className="font-medium">{assignment.location.name}</p>
                    </div>
                    <button onClick={() => openAssignModal(assignment.date)} className="ml-auto px-4 py-2 bg-yellow-500 text-white rounded-md text-sm font-semibold hover:bg-yellow-600">
                      Reasignar
                    </button>
                  </div>
                ) : (
                  <button onClick={() => openAssignModal(assignment.date)} className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5" />
                    Asignar Guardia
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedDate && (
        <AssignGuardModal
          isOpen={isModalOpen}
          onClose={() => setModalOpen(false)}
          onSave={handleSaveAssignment}
          date={selectedDate}
        />
      )}
    </div>
  );
};

export default GuardiasPage;
