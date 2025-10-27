'use client';

import React, { useState } from 'react';
import GuardRoster from '../../components/GuardRoster';
import Sidebar from '../../components/Sidebar';
import AssignGuardForm from '../../components/AssignGuardForm';
import StaffHistory from '../../components/StaffHistory';

const GuardiasPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <main className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Gestión de Guardias</h1>
            <button
              onClick={handleOpenModal}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Asignar Guardia
            </button>
          </div>
          <GuardRoster />
          <div className="mt-8">
            <StaffHistory />
          </div>
        </main>
      </div>
      {isModalOpen && <AssignGuardForm onClose={handleCloseModal} />}
    </div>
  );
};

export default GuardiasPage;
