// Backend guarda: "2026-05-08 18:19:53.148"
// Para <input type="date">
export const parseBackendDate = (raw) => {
  if (!raw) return '';
  return raw.split(' ')[0];
};

// Para enviar al backend en POST/PUT
export const toISODate = (inputValue) => {
  if (!inputValue) return null;
  return new Date(inputValue).toISOString();
};

export const formatDisplayDate = (raw) => {
  if (!raw) return '—';
  const d = new Date(raw.split(' ')[0]);
  return d.toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' });
};