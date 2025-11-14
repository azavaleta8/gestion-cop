"use client";

import React from "react";
import Loader from "@/components/Loader";
import { usePathname } from "next/navigation";
import Image from "next/image";

interface Column<T> {
  header: string;
  accessor: keyof T;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  sortValue?: (item: T) => string | number | Date | null | undefined;
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
  serverSortKey?: keyof T | null;
  serverSortDir?: "asc" | "desc";
  onSortChange?: (key: keyof T, dir: "asc" | "desc") => void;
}

const Table = <T extends { id: number | string; name?: string }>({
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
  serverSortKey = null,
  serverSortDir = "asc",
  onSortChange,
}: TableProps<T>) => {
  const pathname = usePathname();

  // Determinar el mensaje del tooltip según la ruta
  const getTooltipMessage = (itemName?: string) => {
    const name = itemName || "este elemento";

    if (pathname.includes("localizaciones")) {
      return `Hacer clic para visualizar el historial de guardias del servicio ${name.toUpperCase()}`;
    } else if (pathname.includes("trabajadores")) {
      return `Hacer clic para visualizar el historial de guardias de ${name.toUpperCase()}`;
    } else {
      return `Hacer clic para visualizar ficha ${name}`;
    }
  };

  const totalPages = totalItems > 0 ? Math.ceil(totalItems / itemsPerPage) : 0;

  const [sortKey, setSortKey] = React.useState<keyof T | null>(null);
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("asc");

  const isServerSort =
    serverSortKey !== null && typeof onSortChange === "function";

  const sortedData = React.useMemo(() => {
    if (isServerSort) return data; // server controls ordering
    if (!sortKey) return data;
    const col = columns.find((c) => c.accessor === sortKey);
    if (!col || !col.sortable) return data;
    const getVal = (item: T) =>
      col.sortValue
        ? col.sortValue(item)
        : (item[col.accessor] as unknown as
            | string
            | number
            | Date
            | null
            | undefined);
    const copy = [...data];
    copy.sort((a, b) => {
      const va = getVal(a);
      const vb = getVal(b);
      if (va == null && vb == null) return 0;
      if (va == null) return 1; // nulls last
      if (vb == null) return -1;
      const parseMaybeDate = (v: unknown): number | string => {
        if (v instanceof Date) return v.getTime();
        if (typeof v === "number") return v;
        if (typeof v === "string") {
          const parsed = Date.parse(v);
          if (!Number.isNaN(parsed) && !col.sortValue) return parsed;
          return v;
        }
        return String(v ?? "");
      };
      const aComp = parseMaybeDate(va);
      const bComp = parseMaybeDate(vb);
      let cmp = 0;
      if (typeof aComp === "number" && typeof bComp === "number") {
        cmp = aComp < bComp ? -1 : aComp > bComp ? 1 : 0;
      } else {
        const as = String(aComp);
        const bs = String(bComp);
        cmp = as.localeCompare(bs);
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return copy;
  }, [data, columns, sortKey, sortDir, isServerSort]);

  const toggleSort = (key: keyof T, enabled?: boolean) => {
    if (!enabled) return;
    if (isServerSort) {
      const activeKey = serverSortKey as keyof T | null;
      const activeDir = serverSortDir;
      if (activeKey !== key) {
        onSortChange && onSortChange(key, "asc");
      } else {
        onSortChange && onSortChange(key, activeDir === "asc" ? "desc" : "asc");
      }
    } else {
      if (sortKey !== key) {
        setSortKey(key);
        setSortDir("asc");
      } else {
        setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
      }
    }
  };

  return (
    <div>
      {loading && (
        <div className="flex flex-col items-center justify-center h-60 w-full">
          <Loader />
        </div>
      )}
      {!loading && data.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-60 text-gray-500 w-full">
          <img
            src="/no-results.svg"
            alt="Sin resultados"
            className="w-28 h-28 mb-2"
            style={{ objectFit: "contain" }}
          />
          <span>No se encontraron resultados</span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-50 text-gray-700 uppercase text-sm tracking-wider">
              <tr>
                {columns.map((col) => {
                  const isActive = isServerSort
                    ? serverSortKey === col.accessor
                    : sortKey === col.accessor;
                  return (
                    <th
                      key={String(col.accessor)}
                      className="px-4 py-3 text-left select-none"
                    >
                      {col.sortable ? (
                        <button
                          type="button"
                          onClick={() => toggleSort(col.accessor, col.sortable)}
                          className="flex items-center gap-1 text-left"
                        >
                          <span className="uppercase text-center font-bold">
                            {col.header}
                          </span>
                          <span className="text-gray-400 text-xs">
                            {isActive
                              ? (isServerSort ? serverSortDir : sortDir) ===
                                "asc"
                                ? "▲"
                                : "▼"
                              : "↕"}
                          </span>
                        </button>
                      ) : (
                        col.header
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedData.map((item, rowIndex) => (
                <tr
                  key={item.id}
                  data-tooltip-id="row-tooltip"
                  data-tooltip-delay-show={200}
                  data-tooltip-content={getTooltipMessage(item.name as string)}
                  onClick={() => onRowClick && onRowClick(item)}
                  className={`cursor-pointer hover:bg-cyan-200 ${
                    selectedRow?.id === item.id ? "bg-green-200" : ""
                  }`}
                >
                  {columns.map((column, colIndex) => (
                    <td key={String(column.accessor)} className="px-4 py-3">
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
              Mostrando del{" "}
              {data.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} al{" "}
              {Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems}{" "}
              resultados
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
                onClick={() =>
                  onPageChange(Math.min(currentPage + 1, totalPages))
                }
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
