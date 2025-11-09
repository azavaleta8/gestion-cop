'use client';

import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import SearchBar from './SearchBar';
import Table from './Table';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { Tooltip } from 'react-tooltip';

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
  total_assignments?: number;
  last_guard?: string | null;
  month_count?: number;
  last_date?: string | null;
  is_free?: boolean;
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

  const [prioritize, setPrioritize] = useState(true);
  const [staffLoading, setStaffLoading] = useState(false);

  const [locations, setLocations] = useState<Location[]>([]);
  const [locationSearch, setLocationSearch] = useState('');
  const [locationPage, setLocationPage] = useState(1);
  const [totalLocationPages, setTotalLocationPages] = useState(0);
  const debouncedLocationSearch = useDebounce(locationSearch, 500);
  const [locationsLoading, setLocationsLoading] = useState(false);

  const limit = 4;

  // Refetch staff when page/search/prioritize changes
  useEffect(() => {
    if (isOpen) {
      fetchStaff();
    }
  }, [isOpen, staffPage, debouncedStaffSearch, prioritize]);

  // Refetch locations when page/search changes
  useEffect(() => {
    if (isOpen) {
      fetchLocations();
    }
  }, [isOpen, locationPage, debouncedLocationSearch]);

  const fetchStaff = async () => {
    setStaffLoading(true);
    const ymd = date.toISOString().slice(0, 10);
    try {
      const params = new URLSearchParams({
        date: ymd,
        page: String(staffPage),
        limit: String(limit),
        search: debouncedStaffSearch,
        prioritize: prioritize ? '1' : '0',
      });
      const res = await fetch(`/api/staff/candidates?${params.toString()}`);
      if (!res.ok) {
        setStaffList([]);
        setTotalStaffPages(0);
        return;
      }
      const { candidates, total } = await res.json();
      setStaffList(candidates);
      setTotalStaffPages(Math.ceil((total || 0) / limit));
    } finally {
      setStaffLoading(false);
    }
  };

  const fetchLocations = async () => {
    setLocationsLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(locationPage),
        limit: String(4),
        search: debouncedLocationSearch,
      });
      const res = await fetch(`/api/locations?${params.toString()}`);
      if (!res.ok) {
        setLocations([]);
        setTotalLocationPages(0);
        return;
      }
      const { locations, total } = await res.json();
      setLocations(locations);
      setTotalLocationPages(Math.ceil(total / limit));
    } finally {
      setLocationsLoading(false);
    }
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
    { header: 'Rango', accessor: 'rol', render: (item: Staff) => item.rol.name },
    { header: 'Mes', accessor: 'month_count', render: (item: Staff) => item.month_count ?? 0 },
    { header: 'Última', accessor: 'last_date', render: (item: Staff) => item.last_date ? new Date(item.last_date).toLocaleDateString('es-ES') : '—' },
  ];

  const locationColumns: { header: string; accessor: keyof Location; render?: (item: Location) => React.ReactNode }[] = [
    { header: 'Nombre', accessor: 'name' },
  ];

  // Verificar si ambos están seleccionados
  const isSaveDisabled = !selectedStaff || !selectedLocation;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Asignar Guardia - ${date.toLocaleDateString('es-ES')}`}
      size="6xl">

      {/* Header con los títulos lado a lado */}
      <div className="grid grid-cols-3 gap-8 mb-4">
        <div className="col-span-2">
          <h3 className="text-lg font-semibold">1. Seleccionar Funcionario</h3>
        </div>
        <div className="col-span-1">
          <h3 className="text-lg font-semibold">2. Seleccionar Ubicación</h3>
        </div>
      </div>

      <div className="grid grid-cols-3 max-h-[70vh] gap-8">
        {/* Staff Selection - 2/3 width */}
        <div className="col-span-2 flex flex-col gap-4">
          <div className="flex flex-row gap-4">
            <div className='w-[400px]'>
              <SearchBar
                placeholder="Buscar funcionario"
                onSearchChange={setStaffSearch}
              />
            </div>
            <div className="flex flex-col mb-4 text-left">
              <div className='text-md font-semibold'>Filtros:</div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  data-tooltip-id='no-repeat-checkbox'
                  data-tooltip-content={"Prioriza funcionarios que no han tenido guardias las últimas 4 semanas"}
                  data-tooltip-delay-show={200}
                  className='hover:cursor-pointer'
                  type="checkbox"
                  checked={prioritize}
                  onChange={(e) => {
                    setPrioritize(e.target.checked);
                    setStaffPage(1);
                  }}
                />
                No repetidos
              </label>
            </div>
          </div>
          <div className="border rounded-md flex-1">
            {staffLoading ? (
              <div className="flex items-center justify-center h-40">
                <img src="/spinner.svg" alt="Cargando funcionarios" className="w-10 h-10" />
              </div>
            ) : (
              <Table
                columns={staffColumns}
                data={staffList}
                onRowClick={setSelectedStaff}
                selectedRow={selectedStaff}
              />
            )}
          </div>
          <div className="flex justify-between items-center">
            <button
              onClick={() => setStaffPage(p => Math.max(1, p - 1))}
              disabled={staffPage === 1}
              className="font-semibold px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 
              disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer"
            >
              Anterior
            </button>
            <span>Página {staffPage} de {totalStaffPages}</span>
            <button
              onClick={() => setStaffPage(p => Math.min(totalStaffPages, p + 1))}
              disabled={staffPage === totalStaffPages}
              className="font-semibold px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer"
            >
              Siguiente
            </button>
          </div>
        </div>

        {/* Location Selection - 1/3 width */}
        <div className="col-span-1 flex flex-col gap-4">
          <SearchBar placeholder="Buscar ubicación..." onSearchChange={setLocationSearch} />
          <div className="border rounded-md flex-1">
            {locationsLoading ? (
              <div className="flex items-center justify-center h-40">
                <img src="/spinner.svg" alt="Cargando ubicaciones" className="w-10 h-10" />
              </div>
            ) : (
              <Table
                columns={locationColumns}
                data={locations}
                onRowClick={setSelectedLocation}
                selectedRow={selectedLocation}
              />
            )}
          </div>
          <div className="flex justify-between items-center">
            <button
              onClick={() => setLocationPage(p => Math.max(1, p - 1))}
              disabled={locationPage === 1}
              className="font-semibold px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer"
            >
              Anterior
            </button>
            <span>Página {locationPage} de {totalLocationPages}</span>
            <button
              onClick={() => setLocationPage(p => Math.min(totalLocationPages, p + 1))}
              disabled={locationPage === totalLocationPages}
              className="font-semibold px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>

      <div className="mt-3 flex justify-end gap-4">
        <button 
          onClick={handleClose} className="font-semibold px-4 py-2 bg-gray-200 rounded-md
        hover:bg-gray-300 hover:cursor-pointer">Cancelar</button>
        <button
          onClick={handleSave}
          disabled={isSaveDisabled}
          className={
            `font-semibold px-4 py-2 text-white rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed hover:cursor-pointer transition-colors duration-200 ${isSaveDisabled ? 'bg-gray-400' : 'bg-blue-600'} ${!isSaveDisabled ? 'hover:bg-blue-700' : ''}`
          }
        >
          Guardar
        </button>
      </div>

      <Tooltip
        id="no-repeat-checkbox"
        place="bottom"
        variant="info"
        offset={10}
      />

      <Tooltip
        id="cancel-button"
        place="bottom"
        variant="info"
        offset={10}
      />
      <Tooltip
        id="save-button"
        place="bottom"
        variant="info"
        offset={10}
      />
    </Modal>
  );
};

export default AssignGuardModal;