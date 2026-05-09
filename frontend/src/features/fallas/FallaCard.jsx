import { useState, useRef } from 'react';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { eliminarFalla } from './fallaService';
import { subirImagenFalla } from './imagenService';
import { compressImage, formatBytes } from '../../hooks/useImageCompressor';

const gravedadVariant = (g) => {
  if (g === 'Alta') return 'red';
  if (g === 'Media') return 'amber';
  return 'default';
};

export default function FallaCard({ falla, onDeleted, onImageUploaded }) {
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null); // { savedPercent, compressedSize } | null
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const fileRef = useRef();

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    setDeleting(true);
    try {
      await eliminarFalla(falla.id);
      onDeleted(falla.id);
    } catch {
      alert('No se pudo eliminar la falla');
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setUploadStatus(null);

    try {
      // 1. Comprimir antes de subir
      const { file: compressed, savedPercent, compressedSize } = await compressImage(file);

      // 2. Subir el archivo comprimido
      await subirImagenFalla(falla.id, compressed);

      // 3. Mostrar feedback brevemente
      if (savedPercent > 0) {
        setUploadStatus({ savedPercent, compressedSize });
        setTimeout(() => setUploadStatus(null), 3500);
      }

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
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Badge variant={gravedadVariant(falla.nivel_gravedad)}>
              {falla.nivel_gravedad}
            </Badge>
            <Badge>{falla.categoria_falla}</Badge>
          </div>
          <p className="text-zinc-200 font-mono text-sm leading-relaxed">
            {falla.descripcion}
          </p>
        </div>
      </div>

      {/* Feedback de compresión */}
      {uploadStatus && (
        <div className="mb-3 bg-green-500/10 border border-green-500/30 px-3 py-2 flex items-center gap-2">
          <span className="text-green-400 text-xs">✓</span>
          <p className="text-green-400 font-mono text-xs">
            Imagen optimizada — {formatBytes(uploadStatus.compressedSize)} 
            {' '}(-{uploadStatus.savedPercent}% de tamaño)
          </p>
        </div>
      )}

      {/* Imágenes */}
      {falla.imagenes?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {falla.imagenes.map((img) => (
            <a key={img.id} href={img.url_imagen} target="_blank" rel="noreferrer">
              <img
                src={img.url_imagen}
                alt="falla"
                className="w-16 h-16 md:w-20 md:h-20 object-cover border border-zinc-700 hover:border-amber-500 transition-colors rounded"
              />
            </a>
          ))}
        </div>
      )}

      {/* Acciones */}
      <div className="flex gap-2 pt-3 border-t border-zinc-800">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileChange}
        />
        <Button
          size="sm"
          variant="ghost"
          className="flex-1"
          onClick={() => fileRef.current.click()}
          disabled={uploading}
        >
          {uploading ? (
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 border-2 border-zinc-500 border-t-amber-400 rounded-full animate-spin" />
              Procesando...
            </span>
          ) : (
            '📷 Foto'
          )}
        </Button>
        <Button
          size="sm"
          variant={confirmDelete ? 'danger' : 'ghost'}
          onClick={handleDelete}
          disabled={deleting}
          className="flex-1"
        >
          {deleting ? '...' : confirmDelete ? '¿Confirmar?' : '🗑 Eliminar'}
        </Button>
      </div>
    </div>
  );
}