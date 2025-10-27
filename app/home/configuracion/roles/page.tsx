'use client';

import React from 'react';  
import RolesManager from '../../../../components/RolesManager';

const RolesPage = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex-1 flex flex-col">
        <main className="p-4">
          <h1 className="text-2xl font-bold mb-4">Gestión de Roles</h1>
          <RolesManager />
        </main>
      </div>
    </div>
  );
};

export default RolesPage;
