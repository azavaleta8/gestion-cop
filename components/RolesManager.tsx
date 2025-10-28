'use client';

import React, { useState, useEffect } from 'react';
import useDebounce from "@/lib/hooks/useDebounce";
import SearchBar from "@/components/SearchBar";
import Modal from "@/components/Modal";
import Table from "@/components/Table";
import { Button, Input } from "@heroui/react";
import { PlusIcon } from '@heroicons/react/24/solid';

interface Rol {
  id: number;
  name: string;
}

const RolesManager = () => {
  const [roles, setRoles] = useState<Rol[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [newRolName, setNewRolName] = useState('');
  const [totalRoles, setTotalRoles] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [editingRol, setEditingRol] = useState<Rol | null>(null);

  const debouncedSearch = useDebounce(search, 500);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(itemsPerPage),
        search: debouncedSearch,
      });
      const response = await fetch(`/api/roles?${params.toString()}`);
      const data = await response.json();
      setRoles(data.roles);
      setTotalRoles(data.total);
    } catch (error) {
      console.error('Error fetching roles:', error);
      setMessage('Error al cargar los roles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, [currentPage, itemsPerPage, debouncedSearch]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newRolName }),
      });
      if (response.ok) {
        setNewRolName('');
        setShowForm(false);
        fetchRoles();
      }
    } catch (error) {
      console.error('Error creating rol:', error);
    }
  };

  const handleUpdate = async (rol: Rol) => {
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
  
  const handleDelete = async (rolId: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este rol?')) {
        try {
            const response = await fetch(`/api/roles/${rolId}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                fetchRoles();
            } else {
                const data = await response.json();
                alert(data.message || 'Error al eliminar el rol.');
            }
        } catch (error) {
            console.error('Error deleting rol:', error);
            alert('Error de red al eliminar el rol.');
        }
    }
  };

  const columns: { header: string; accessor: keyof Rol; render?: (item: Rol) => React.ReactNode }[] = [
    { header: 'Nombre', accessor: 'name' },
    {
      header: 'Acciones',
      accessor: 'id',
      render: (item: Rol) => (
        <div className="flex gap-2">
          <Button
            color="primary"
            onClick={() => setEditingRol(item)}
            className="bg-yellow-500 hover:bg-yellow-600 text-white"
          >
            Editar
          </Button>
          {/* <Button
            color="danger"
            onClick={() => handleDelete(item.id)}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            Eliminar
          </Button> */}
        </div>
      ),
    },
  ];

  return (
    <>
      <h1 className="text-2xl font-bold mb-5">Rangos</h1>
  
      <div className="flex justify-between items-center mb-6">
          <div className="w-1/3">
              <SearchBar
                  placeholder="Buscar por nombre..."
                  onSearchChange={setSearch}
              />
          </div>
          <button className={`px-4 py-2 text-white rounded transition flex items-center gap-2 bg-green-600 hover:bg-green-700`}
              onClick={() => setShowForm(true)}
          >
              <PlusIcon className="w-5 h-5" />
              Agregar Nuevo Rol
          </button>
      </div>

      <Modal
          isOpen={showForm}
          onClose={() => setShowForm(false)}
          title="Agregar Nuevo Rol"
      >
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
              <Input
                  label="Nombre del rol"
                  placeholder="Ej. Administrador"
                  value={newRolName}
                  onChange={(e) => setNewRolName(e.target.value)}
              />
              <Button
                  type="submit"
                  disabled={!newRolName.trim()}
                  className={`w-full ${!newRolName.trim() ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                  Guardar Rol
              </Button>
          </form>
      </Modal>

      <Modal
          isOpen={!!editingRol}
          onClose={() => setEditingRol(null)}
          title="Editar Rol"
      >
          {editingRol && (
              <form onSubmit={(e) => { e.preventDefault(); handleUpdate(editingRol); }} className="flex flex-col gap-4">
                  <Input
                      label="Nombre del rol"
                      value={editingRol.name}
                      onChange={(e) => setEditingRol({ ...editingRol, name: e.target.value })}
                  />
                  <Button
                      type="submit"
                      disabled={!editingRol.name.trim()}
                      className={`w-full ${!editingRol.name.trim() ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
                  >
                      Actualizar Rol
                  </Button>
              </form>
          )}
      </Modal>

      <Table
        columns={columns}
        data={roles}
        loading={loading}
        totalItems={totalRoles}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
      />
    </>
  );
};

export default RolesManager;
