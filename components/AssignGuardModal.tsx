'use client';

import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import SearchBar from './SearchBar';
import Table from './Table';
import { useDebounce } from '@/lib/hooks/useDebounce';

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
}

interface AssignGuardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (staff: Staff, location: Location) => void;
  date: Date;
}

const AssignGuardModal: React.FC<AssignGuardModalProps> = ({ isOpen, onClose, onSave, date }) => {
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [staffSearch, setStaffSearch] = useState('');
  const [staffPage, setStaffPage] = useState(1);
  const [totalStaffPages, setTotalStaffPages] = useState(0);
  const debouncedStaffSearch = useDebounce(staffSearch, 500);

  const [locations, setLocations] = useState<Location[]>([]);
  const [locationSearch, setLocationSearch] = useState('');
  const [locationPage, setLocationPage] = useState(1);
  const [totalLocationPages, setTotalLocationPages] = useState(0);
  const debouncedLocationSearch = useDebounce(locationSearch, 500);

  const limit = 5;

  useEffect(() => {
    if (isOpen) {
      fetchStaff();
      fetchLocations();
    }
  }, [isOpen, staffPage, debouncedStaffSearch, locationPage, debouncedLocationSearch]);

  const fetchStaff = async () => {
    const params = new URLSearchParams({
      page: String(staffPage),
      limit: String(limit),
      search: debouncedStaffSearch,
    });
    const res = await fetch(`/api/users?${params.toString()}`);
    const { funcionarios, total } = await res.json();
    setStaffList(funcionarios);
    setTotalStaffPages(Math.ceil(total / limit));
  };

  const fetchLocations = async () => {
    const params = new URLSearchParams({
      page: String(locationPage),
      limit: String(limit),
      search: debouncedLocationSearch,
    });
    const res = await fetch(`/api/locations?${params.toString()}`);
    const { locations, total } = await res.json();
    setLocations(locations);
    setTotalLocationPages(Math.ceil(total / limit));
  };

  const handleSave = () => {
    if (selectedStaff && selectedLocation) {
      onSave(selectedStaff, selectedLocation);
      handleClose();
    } else {
      alert('Por favor, seleccione un funcionario y una ubicación.');
    }
  };

  const handleClose = () => {
    setSelectedStaff(null);
    setSelectedLocation(null);
    setStaffSearch('');
    setLocationSearch('');
    setStaffPage(1);
    setLocationPage(1);
    onClose();
  };

  const staffColumns: { header: string; accessor: keyof Staff; render?: (item: Staff) => React.ReactNode }[] = [
    { header: 'Nombre', accessor: 'name' },
    { header: 'Cédula', accessor: 'dni' },
    { header: 'Cargo', accessor: 'rol', render: (item: Staff) => item.rol.name },
  ];

  const locationColumns: { header: string; accessor: keyof Location; render?: (item: Location) => React.ReactNode }[] = [
    { header: 'Nombre', accessor: 'name' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Asignar Guardia - ${date.toLocaleDateString('es-ES')}`} size="4xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Staff Selection */}
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-semibold">1. Seleccionar Funcionario</h3>
          <SearchBar placeholder="Buscar funcionario..." onSearchChange={setStaffSearch} />
          <div className="border rounded-md">
            <Table
              columns={staffColumns}
              data={staffList}
              onRowClick={setSelectedStaff}
              selectedRow={selectedStaff}
            />
          </div>
          <div className="flex justify-between items-center">
            <button onClick={() => setStaffPage(p => Math.max(1, p - 1))} disabled={staffPage === 1}>Anterior</button>
            <span>Página {staffPage} de {totalStaffPages}</span>
            <button onClick={() => setStaffPage(p => Math.min(totalStaffPages, p + 1))} disabled={staffPage === totalStaffPages}>Siguiente</button>
          </div>
        </div>

        {/* Location Selection */}
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-semibold">2. Seleccionar Ubicación</h3>
          <SearchBar placeholder="Buscar ubicación..." onSearchChange={setLocationSearch} />
          <div className="border rounded-md">
            <Table
              columns={locationColumns}
              data={locations}
              onRowClick={setSelectedLocation}
              selectedRow={selectedLocation}
            />
          </div>
          <div className="flex justify-between items-center">
            <button onClick={() => setLocationPage(p => Math.max(1, p - 1))} disabled={locationPage === 1}>Anterior</button>
            <span>Página {locationPage} de {totalLocationPages}</span>
            <button onClick={() => setLocationPage(p => Math.min(totalLocationPages, p + 1))} disabled={locationPage === totalLocationPages}>Siguiente</button>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end gap-4">
        <button onClick={handleClose} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">Cancelar</button>
        <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Guardar Asignación</button>
      </div>
    </Modal>
  );
};

export default AssignGuardModal;
