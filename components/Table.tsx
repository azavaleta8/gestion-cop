"use client";

import React from 'react';
import Loader from '@/components/Loader';
import { useRouter } from 'next/navigation';

interface Column<T> {
  header: string;
  accessor: keyof T;
  render?: (item: T) => React.ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading: boolean;
  totalItems: number;
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (limit: number) => void;
  onRowClick?: (item: T) => void;
}

const Table = <T extends { id: number | string }>({
  columns,
  data,
  loading,
  totalItems,
  currentPage,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  onRowClick,
}: TableProps<T>) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <div>
      {loading ? (
        <div className="flex flex-col items-center justify-center h-60 w-full">
          <Loader />
        </div>
      ) : data.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-60 text-gray-500 w-full">
          <img
            src="/no-results.svg"
            alt="Sin resultados"
            className="w-28 h-28 mb-2"
            style={{ objectFit: 'contain' }}
          />
          <span>No se encontraron resultados</span>
        </div>
      ) : (
        <table className="min-w-full bg-white mx-auto border border-gray-300 rounded-lg shadow-lg overflow-hidden">
          <thead className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 uppercase text-sm tracking-wider">
            <tr>
              {columns.map((col) => (
                <th key={String(col.accessor)} className="px-4 py-3 text-left">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((item) => (
              <tr
                key={item.id}
                className="hover:bg-gray-50 transition-colors duration-200"
                onClick={() => onRowClick && onRowClick(item)}
              >
                {columns.map((col) => (
                  <td key={String(col.accessor)} className="px-4 py-3">
                    {col.render ? col.render(item) : (item[col.accessor] as React.ReactNode)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="flex justify-between items-center mt-6">
        <div>
          <span className="text-sm text-gray-600">
            Mostrando del {data.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} al{' '}
            {Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems} resultados
          </span>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={itemsPerPage}
            onChange={(e) => {
              onItemsPerPageChange(Number(e.target.value));
              onPageChange(1);
            }}
            className="px-2 py-1 border border-gray-300 rounded-md text-sm"
          >
            <option value={10}>10 por página</option>
            <option value={20}>20 por página</option>
            <option value={30}>30 por página</option>
          </select>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded-md bg-white hover:bg-gray-100 disabled:opacity-50"
            >
              Anterior
            </button>
            <span className="text-sm">
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded-md bg-white hover:bg-gray-100 disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Table;
