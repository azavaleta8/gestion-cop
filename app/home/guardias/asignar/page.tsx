'use client';

import React, { useState, useEffect } from 'react';

// Helper to get the start of the week (Sunday) for a given date
const getStartOfWeek = (date: Date) => {
  const newDate = new Date(date);
  const day = newDate.getDay(); // 0 for Sunday, 1 for Monday, etc.
  const diff = newDate.getDate() - day;
  return new Date(newDate.setDate(diff));
};

import WeeklyGuardManager from '../../../../components/WeeklyGuardManager';

const AsignarGuardiaPage = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex-1 flex flex-col p-4">
        <h1 className="text-2xl font-bold mb-4">Asignar Guardia Semanal</h1>
        <WeeklyGuardManager readOnly={false} />
      </div>
    </div>
  );
};

export default AsignarGuardiaPage;
