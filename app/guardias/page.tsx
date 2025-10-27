'use client';

import React from 'react';
import Link from 'next/link';
import GuardRoster from '../../components/GuardRoster';
import Sidebar from '../../components/Sidebar';
import StaffHistory from '../../components/StaffHistory';

const GuardiasPage = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <main className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Gestión de Guardias</h1>
            <Link
              href="/guardias/asignar"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Asignar Guardia Semanal
            </Link>
          </div>
          <GuardRoster />
          <div className="mt-8">
            <StaffHistory />
          </div>
        </main>
      </div>
    </div>
  );
};

export default GuardiasPage;
