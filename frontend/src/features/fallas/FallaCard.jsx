import { useState, useRef } from 'react';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { eliminarFalla } from './fallaService';
import { subirImagenFalla } from './imagenService';

const gravedadVariant = (g) => {
  if (g === 'Alta') return 'red';
  if (g === 'Media') return 'amber';
  return 'default';
};

export default function FallaCard({ falla, onDeleted, onImageUploaded }) {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const fileRef = useRef();

  const handleDelete = async () => {
    if (!confirm('¿Eliminar esta falla y sus imágenes?')) return;
    setDeleting(true);
    try {
      await eliminarFalla(falla.id);
      onDeleted(falla.id);
    } catch {
      alert('No se pudo eliminar la falla');
    } finally {
      setDeleting(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      await subirImagenFalla(falla.id, file);
      onImageUploaded();
    } catch {
      alert('Error al subir imagen');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 p-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant={gravedadVariant(falla.nivel_gravedad)}>{falla.nivel_gravedad}</Badge>
            <Badge>{falla.categoria_falla}</Badge>
          </div>
          <p className="text-zinc-200 font-mono text-sm">{falla.descripcion}</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          <Button
            size="sm"
            variant="ghost"
            onClick={() => fileRef.current.click()}
            disabled={uploading}
          >
            {uploading ? '↑ Subiendo...' : '+ Foto'}
          </Button>
          <Button size="sm" variant="danger" onClick={handleDelete} disabled={deleting}>
            {deleting ? '...' : '✕'}
          </Button>
        </div>
      </div>

      {/* Images */}
      {falla.imagenes?.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-zinc-800">
          {falla.imagenes.map((img) => (
            <a key={img.id} href={img.url_imagen} target="_blank" rel="noreferrer">
              <img
                src={img.url_imagen}
                alt="falla"
                className="w-20 h-20 object-cover border border-zinc-700 hover:border-amber-500 transition-colors"
              />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}