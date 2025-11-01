import React from 'react';
import { formatDate, getTimeAgo } from '@/lib/date';

interface Location {
  id?: number;
  name?: string | null;
}

interface GuardDuty {
  id: number;
  assignedDate: string | null;
  location?: Location | null;
}

interface Props {
  duties: GuardDuty[];
  page: number;
  totalPages: number;
  // Accept the React state setter form so callers can pass either a value or an updater callback
  setPage: React.Dispatch<React.SetStateAction<number>>;
}

const StaffHistory: React.FC<Props> = ({ duties, page, totalPages, setPage }) => {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-2 text-gray-800">HISTORIAL</h3>
      {duties.length === 0 ? (
        <div className="text-sm text-gray-600">No hay guardias registradas para este funcionario.</div>
      ) : (
        <div className="relative">
          <img
            src="/images/LOGO-PNB.jpg"
            alt="Logo"
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] object-contain opacity-10 pointer-events-none"
          />
          <div className="overflow-x-auto">
            <table className="w-full text-sm table-auto">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2">Fecha</th>
                  <th className="py-2">Tiempo</th>
                  <th className="py-2">Ubicación</th>
                </tr>
              </thead>
              <tbody>
                {duties.map((d) => (
                  <tr key={d.id} className="border-b">
                    <td className="py-2 font-mono">{formatDate(d.assignedDate)}</td>
                    <td className="py-2">{getTimeAgo(d.assignedDate)}</td>
                    <td className="py-2">{d.location?.name ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-600">Página {page} de {totalPages}</div>
            <div className="flex gap-2">
              <button
                className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 transition-colors"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >Anterior</button>
              <button
                className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 transition-colors"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >Siguiente</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffHistory;
