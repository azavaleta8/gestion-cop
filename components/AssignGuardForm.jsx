'use client';

import React, { useState, useEffect } from 'react';

const AssignGuardForm = ({ onClose }) => {
  const [staff, setStaff] = useState([]);
  const [roles, setRoles] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [lastGuard, setLastGuard] = useState('');

  // Fetch initial data for dropdowns
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [staffRes, rolesRes, locationsRes] = await Promise.all([
          fetch('/api/users'),
          fetch('/api/roles'),
          fetch('/api/locations'),
        ]);
        const staffData = await staffRes.json();
        const rolesData = await rolesRes.json();
        const locationsData = await locationsRes.json();
        setStaff(Array.isArray(staffData.users) ? staffData.users : []);
        setRoles(Array.isArray(rolesData.roles) ? rolesData.roles : []);
        setLocations(Array.isArray(locationsData.locations) ? locationsData.locations : []);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  // Fetch last guard date when a staff member is selected
  useEffect(() => {
    if (!selectedStaffId) {
      setLastGuard('');
      return;
    }
    const selectedStaffMember = staff.find(s => s.id === parseInt(selectedStaffId));
    if (selectedStaffMember) {
        setLastGuard(selectedStaffMember.last_guard ? new Date(selectedStaffMember.last_guard).toLocaleDateString() : 'N/A');
    }
  }, [selectedStaffId, staff]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      assignedDate: formData.get('assignedDate'),
      assignedStaffId: parseInt(formData.get('assignedStaffId')),
      locationId: parseInt(formData.get('locationId')),
      rolId: parseInt(formData.get('rolId')),
      notes: formData.get('notes'),
    };

    try {
      const response = await fetch('/api/guards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        onClose(); // Close modal on success
      } else {
        console.error('Error creating guard duty');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-xl w-1/3">
        <h2 className="text-2xl font-bold mb-4">Asignar Nueva Guardia</h2>
        <form onSubmit={handleSubmit}>
          {/* Form fields */}
          <div className="mb-4">
            <label htmlFor="assignedDate" className="block text-sm font-medium text-gray-700">Fecha</label>
            <input type="date" name="assignedDate" id="assignedDate" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"/>
          </div>

          <div className="mb-4">
            <label htmlFor="assignedStaffId" className="block text-sm font-medium text-gray-700">Funcionario</label>
            <select name="assignedStaffId" id="assignedStaffId" value={selectedStaffId} onChange={(e) => setSelectedStaffId(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
              <option value="">Seleccione un funcionario</option>
              {staff.map((s) => (<option key={s.id} value={s.id}>{s.name}</option>))}
            </select>
            {lastGuard && <p className="text-sm text-gray-500 mt-1">Última guardia: {lastGuard}</p>}
          </div>

          <div className="mb-4">
            <label htmlFor="locationId" className="block text-sm font-medium text-gray-700">Ubicación</label>
            <select name="locationId" id="locationId" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                <option value="">Seleccione una ubicación</option>
                {locations.map((l) => (<option key={l.id} value={l.id}>{l.name}</option>))}
            </select>
          </div>
          
          <div className="mb-4">
            <label htmlFor="rolId" className="block text-sm font-medium text-gray-700">Rol</label>
            <select name="rolId" id="rolId" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                <option value="">Seleccione un rol</option>
                {roles.map((r) => (<option key={r.id} value={r.id}>{r.name}</option>))}
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notas</label>
            <textarea name="notes" id="notes" rows="3" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"></textarea>
          </div>

          <div className="flex justify-end gap-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 rounded-md">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-md">Asignar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignGuardForm;
