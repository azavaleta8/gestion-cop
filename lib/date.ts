export const formatDate = (dateString: string | null) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  const days = ['DOM', 'LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB'];
  const day = days[date.getDay()];
  const dayNum = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day} - ${dayNum}/${month}/${year}`;
};

export const formatDateShort = (dateString: string | null) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export const getTimeAgo = (dateString: string | null) => {
  if (!dateString) return '—';

  const now = new Date();
  const assignedDate = new Date(dateString);
  const diffInMs = now.getTime() - assignedDate.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays < 0) {
    const absDays = Math.abs(diffInDays);
    if (absDays < 7) {
      return absDays === 1 ? 'Dentro de 1 día' : `Dentro de ${absDays} días`;
    }
    const weeks = Math.floor(absDays / 7);
    if (absDays < 30) {
      return weeks === 1 ? 'Dentro de 1 semana' : `Dentro de ${weeks} semanas`;
    }
    const months = Math.floor(absDays / 30);
    if (absDays < 365) {
      return months === 1 ? 'Dentro de 1 mes' : `Dentro de ${months} meses`;
    }
    const years = Math.floor(absDays / 365);
    return years === 1 ? 'Dentro de 1 año' : `Dentro de ${years} años`;
  }

  if (diffInDays === 0) return 'Hoy';
  if (diffInDays < 7) return diffInDays === 1 ? 'Hace 1 día' : `Hace ${diffInDays} días`;
  const weeks = Math.floor(diffInDays / 7);
  if (diffInDays < 30) return weeks === 1 ? 'Hace 1 semana' : `Hace ${weeks} semanas`;
  const months = Math.floor(diffInDays / 30);
  if (diffInDays < 365) return months === 1 ? 'Hace 1 mes' : `Hace ${months} meses`;
  const years = Math.floor(diffInDays / 365);
  return years === 1 ? 'Hace 1 año' : `Hace ${years} años`;
};
