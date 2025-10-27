'use client';

import React, { useState } from 'react';

const StaffHistory = () => {
  const [dni, setDni] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!dni) return;

    setLoading(true);
    setSearched(true);
    try {
      const response = await fetch(`/api/guards/history/${dni}`);
      if (response.ok) {
        const data = await response.json();
        setHistory(Array.isArray(data) ? data : []);
      } else {
        console.error('Error fetching history:', response.statusText);
        setHistory([]);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-md shadow-md">
      <h2 className="text-xl font-semibold mb-4">Consultar Historial de Guardias</h2>
      <form onSubmit={handleSearch} className="flex gap-4 mb-4">
        <input
          type="text"
          value={dni}
          onChange={(e) => setDni(e.target.value)}
          placeholder="Introduzca DNI del funcionario"
          className="flex-grow p-2 border border-gray-300 rounded-md"
        />
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-md">
          Buscar
        </button>
      </form>

      {loading ? (
        <p>Buscando historial...</p>
      ) : searched && (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ubicación</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {history.length > 0 ? (
              history.map((duty) => (
                <tr key={duty.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{new Date(duty.assignedDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{duty.rol.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{duty.location.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {duty.actualStaff && duty.actualStaff.dni === dni ? 'Reemplazo' : 'Asignado'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center">No se encontró historial para este DNI.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default StaffHistory;
