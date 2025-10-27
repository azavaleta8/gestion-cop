'use client';

import React, { useState, useEffect } from 'react';

// Helper to get the start of the week (Sunday) for a given date
const getStartOfWeek = (date: Date) => {
  const newDate = new Date(date);
  const day = newDate.getDay(); // 0 for Sunday, 1 for Monday, etc.
  const diff = newDate.getDate() - day;
  return new Date(newDate.setDate(diff));
};

const WeeklyGuardManager = ({ readOnly = false }: { readOnly?: boolean }) => {
  const [locations, setLocations] = useState<{id: number, name: string}[]>([]);
  const [staff, setStaff] = useState<{id: number, name: string, dni: string, rolId: number, nameRol: string}[]>([]);
  const [roles, setRoles] = useState<{id: number, name: string}[]>([]);
  const [currentWeekStart, setCurrentWeekStart] = useState(getStartOfWeek(new Date()));
  const [assignments, setAssignments] = useState<{date: Date, staffId: string | null, locationId: string | null}[]>([]);

  // Fetch locations and staff on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // 1. Fetch all resources in parallel
        const [locationsRes, staffRes, rolesRes] = await Promise.all([
          fetch('/api/locations'),
          fetch('/api/users'),
          fetch('/api/roles')
        ]);

        // 2. Check if all responses are OK
        if (!locationsRes.ok || !staffRes.ok || !rolesRes.ok) {
          console.error('Failed to fetch one or more resources');
          // Optionally set an error state to show in the UI
          return;
        }

        // 3. Parse all JSON bodies in parallel
        const [locationsData, staffData, rolesData] = await Promise.all([
          locationsRes.json(),
          staffRes.json(),
          rolesRes.json()
        ]);

        // 4. Now process the data, confident that everything is available
        const locationsList = locationsData.locations || [];
        const rolesList = rolesData.roles || [];
        const funcionarios = staffData.funcionarios || staffData.users || [];

        setLocations(locationsList);
        setRoles(rolesList);

        const rolesMap = new Map(rolesList.map((rol: { id: number; name: string }) => [rol.id, rol.name]));

        const staffWithRoleNames = funcionarios.map((f: { id: number; name: string; dni: string; rolId: number }) => ({
            ...f,
            nameRol: rolesMap.get(f.rolId) || "Sin rol"
        }));

        setStaff(staffWithRoleNames);

      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };
    fetchInitialData();
  }, []);

  // Re-generate assignments when the week changes
  useEffect(() => {
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
            // Normalize both dates to midnight local time to compare just the date part
            const localGuardDate = new Date(guardDate.getFullYear(), guardDate.getMonth(), guardDate.getDate());
            const localCalendarDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            return localGuardDate.getTime() === localCalendarDate.getTime();
          });

          return {
            date,
            staffId: guardForDay ? String(guardForDay.assignedStaffId) : null,
            locationId: guardForDay ? String(guardForDay.locationId) : null,
          };
        });
        setAssignments(newAssignments);
      } catch (error) {
        console.error("Error fetching guards for week:", error);
        // Fallback to empty assignments on error
        const newAssignments = Array(7).fill(null).map((_, i) => {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            return { date, staffId: null, locationId: null };
        });
        setAssignments(newAssignments);
      }
    };

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

  const handleAssignmentChange = (dayIndex: number, field: 'staffId' | 'locationId', value: string) => {
    const newAssignments = [...assignments];
    newAssignments[dayIndex][field] = value;
    setAssignments(newAssignments);
  };

  const getWeekDisplay = () => {
    const start = new Date(currentWeekStart);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    const startMonth = start.toLocaleString('es-ES', { month: 'long' });
    const endMonth = end.toLocaleString('es-ES', { month: 'long' });

    const monthDisplay = startMonth === endMonth ? startMonth : `${startMonth}/${endMonth}`;

    return {
      start: start.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }),
      end: end.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }),
      month: monthDisplay.charAt(0).toUpperCase() + monthDisplay.slice(1),
    };
  };

  const handleSaveWeek = async () => {
    const dutiesToCreate = assignments
        .filter(a => a.staffId && a.locationId)
        .map(a => {
            const staffMember = staff.find(s => s.id === parseInt(a.staffId!));
            if (!staffMember) return null;
            return {
                assignedDate: a.date,
                assignedStaffId: parseInt(a.staffId!),
                locationId: parseInt(a.locationId!),
                rolId: staffMember.rolId,
            };
        })
        .filter(Boolean);

    if (dutiesToCreate.length === 0) {
        alert('No hay guardias completas para guardar.');
        return;
    }
    
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
  
  const weekDisplay = getWeekDisplay();

  return (
    <div className="flex-1 flex flex-col">
        {/* New Week Navigator */}
        <div className="flex justify-between items-center mb-4 p-2 bg-white rounded-md shadow-sm">
            <button onClick={handlePrevWeek} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">&lt;</button>
            <div className="flex items-center gap-4 text-center">
                <span className="font-semibold">{weekDisplay.start}</span>
                <span className="text-lg uppercase font-bold text-blue-600">{weekDisplay.month}</span>
                <span className="font-semibold">{weekDisplay.end}</span>
            </div>
            <button onClick={handleNextWeek} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">&gt;</button>
        </div>
        
        {/* Assignments List */}
        <div className="flex flex-col gap-4">
            {assignments.map((assignment, index) => (
            <div key={index} className="p-4 border rounded-md bg-white shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <div className="col-span-1">
                <h3 className="font-bold capitalize">{new Date(assignment.date).toLocaleDateString('es-ES', { weekday: 'long' })}</h3>
                <p className="text-sm">{new Date(assignment.date).toLocaleDateString('es-ES')}</p>
                </div>
                <div className="col-span-1">
                {readOnly ? (
                    <p className="p-2 border rounded-md bg-gray-50 min-h-[42px]">
                        {assignment.staffId 
                            ? (staff.find(s => s.id === parseInt(assignment.staffId!))?.name || 'Funcionario no encontrado') + ' (' + (staff.find(s => s.id === parseInt(assignment.staffId!))?.nameRol || '') + ')'
                            : 'Sin asignar'}
                    </p>
                ) : (
                    <select 
                        value={assignment.staffId || ''}
                        onChange={(e) => handleAssignmentChange(index, 'staffId', e.target.value)}
                        className="w-full p-2 border rounded-md bg-gray-50"
                        disabled={readOnly}
                    >
                        <option value="">Asignar funcionario...</option>
                        {staff.map(s => (
                            <option key={s.id || ''} value={s.id || ''}>{s.name || ''} ({s.nameRol || ''})</option>
                        ))}
                    </select>
                )}
                </div>
                <div className="col-span-1">
                {readOnly ? (
                     <p className="p-2 border rounded-md bg-gray-50 min-h-[42px]">
                        {assignment.locationId
                            ? locations.find(l => l.id === parseInt(assignment.locationId!))?.name || 'Ubicación no encontrada'
                            : 'Sin asignar'}
                    </p>
                ) : (
                    <select 
                        value={assignment.locationId || ''}
                        onChange={(e) => handleAssignmentChange(index, 'locationId', e.target.value)}
                        className="w-full p-2 border rounded-md bg-gray-50"
                        disabled={readOnly}
                    >
                        <option value="">Asignar ubicación...</option>
                        {locations.map(loc => (
                            <option key={loc.id} value={loc.id}>{loc.name}</option>
                        ))}
                    </select>
                )}
                </div>
            </div>
            ))}
        </div>
        {!readOnly && (
            <button onClick={handleSaveWeek} className="mt-4 px-6 py-3 bg-green-500 text-white rounded-md self-start hover:bg-green-600">
                Guardar Semana
            </button>
        )}
    </div>
  );
};

export default WeeklyGuardManager;
