'use client';

import React, { useState, useEffect } from 'react';

const RolesManager = () => {
  const [roles, setRoles] = useState([]);
  const [editingRol, setEditingRol] = useState(null);
  const [newRolName, setNewRolName] = useState('');

  const fetchRoles = async () => {
    try {
      const response = await fetch('/api/roles');
      const data = await response.json();
      setRoles(data.roles);
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newRolName }),
      });
      if (response.ok) {
        setNewRolName('');
        fetchRoles();
      }
    } catch (error) {
      console.error('Error creating rol:', error);
    }
  };

  const handleUpdate = async (rol) => {
    try {
      const response = await fetch(`/api/roles/${rol.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: rol.name }),
      });
      if (response.ok) {
        setEditingRol(null);
        fetchRoles();
      }
    } catch (error) {
      console.error('Error updating rol:', error);
    }
  };
  
  const handleDelete = async (rolId) => {
    try {
      const response = await fetch(`/api/roles/${rolId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchRoles();
      }
    } catch (error) {
      console.error('Error deleting rol:', error);
    }
  };

  return (
    <div className="bg-white p-4 rounded-md shadow-md">
      <form onSubmit={handleCreate} className="mb-4 flex gap-4">
        <input
          type="text"
          value={newRolName}
          onChange={(e) => setNewRolName(e.target.value)}
          placeholder="Nombre del nuevo rol"
          className="flex-grow p-2 border border-gray-300 rounded-md"
        />
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-md">Crear</button>
      </form>

      <table className="min-w-full divide-y divide-gray-200">
        {/* Table Head */}
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {roles.map((rol) => (
            <tr key={rol.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                {editingRol?.id === rol.id ? (
                  <input
                    type="text"
                    value={editingRol.name}
                    onChange={(e) => setEditingRol({ ...editingRol, name: e.target.value })}
                    className="p-2 border border-gray-300 rounded-md"
                  />
                ) : (
                  rol.name
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                {editingRol?.id === rol.id ? (
                  <>
                    <button onClick={() => handleUpdate(editingRol)} className="text-green-600 hover:text-green-900 mr-4">Guardar</button>
                    <button onClick={() => setEditingRol(null)} className="text-gray-600 hover:text-gray-900">Cancelar</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => setEditingRol({ ...rol })} className="text-indigo-600 hover:text-indigo-900">Editar</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RolesManager;
