export const guardHistoryUrl = (
  dni: string,
  page: number = 1,
  limit: number = 8,
  sortBy: string = 'assignedDate',
  sortDir: string = 'desc'
) =>
  `/api/guards/history/${encodeURIComponent(dni)}?page=${page}&limit=${limit}&sortBy=${encodeURIComponent(
    sortBy
  )}&sortDir=${encodeURIComponent(sortDir)}`;

export const guardHistoryByLocationUrl = (
  locationId: number | string,
  page: number = 1,
  limit: number = 8,
  sortBy: string = 'assignedDate',
  sortDir: string = 'desc'
) =>
  `/api/guards/history/location/${encodeURIComponent(String(locationId))}?page=${page}&limit=${limit}&sortBy=${encodeURIComponent(
    sortBy
  )}&sortDir=${encodeURIComponent(sortDir)}`;
