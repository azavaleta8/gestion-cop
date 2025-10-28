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
  loading?: boolean;
  totalItems?: number;
  currentPage?: number;
  itemsPerPage?: number;
  onPageChange?: (page: number) => void;
  onItemsPerPageChange?: (limit: number) => void;
  onRowClick?: (item: T) => void;
  selectedRow?: T | null;
}

const Table = <T extends { id: number | string }>({
  columns,
  data,
  loading = false,
  totalItems = 0,
  currentPage = 1,
  itemsPerPage = 10,
  onPageChange = () => {},
  onItemsPerPageChange = () => {},
  onRowClick,
  selectedRow,
}: TableProps<T>) => {
  const totalPages = totalItems > 0 ? Math.ceil(totalItems / itemsPerPage) : 0;

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
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-50 text-gray-700 uppercase text-sm tracking-wider">
              <tr>
                {columns.map((col) => (
                  <th key={String(col.accessor)} className="px-4 py-3 text-left">
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((item, rowIndex) => (
                <tr
                  key={item.id}
                  onClick={() => onRowClick && onRowClick(item)}
                  className={`cursor-pointer hover:bg-gray-100 ${
                    selectedRow?.id === item.id ? 'bg-blue-100' : ''
                  }`}
                >
                  {columns.map((column, colIndex) => (
                    <td
                      key={String(column.accessor)}
                      className="px-4 py-3"
                    >
                      {column.render
                        ? column.render(item)
                        : (item[column.accessor] as React.ReactNode)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
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
      )}
    </div>
  );
};

export default Table;
