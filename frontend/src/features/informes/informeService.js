import api from '../../api/axios';

export const getInformePorRevision = (id_revision) =>
  api.get(`/informes/revision/${id_revision}`);

export const crearInforme = (datos) =>
  api.post('/informes', datos);

export const actualizarInforme = (id_revision, datos) =>
  api.put(`/informes/revision/${id_revision}`, datos);

/**
 * Downloads the PDF for a given revision.
 * Uses fetch directly so we can handle the binary blob properly.
 */
export const descargarPdfInforme = async (id_revision) => {
  const raw    = localStorage.getItem('auth');
  const token  = raw ? JSON.parse(raw).token : null;
  const base   = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

  const res = await fetch(`${base}/informes/revision/${id_revision}/pdf`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? `Error ${res.status}`);
  }

  const blob     = await res.blob();
  const url      = URL.createObjectURL(blob);
  const a        = document.createElement('a');
  a.href         = url;
  a.download     = `informe-FOL-${String(id_revision).padStart(4, '0')}.pdf`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 500);
};