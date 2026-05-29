import { useState, useRef } from 'react';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Toast from '../../components/ui/Toast';
import { eliminarFalla } from './fallaService';
import { subirImagenFalla, eliminarImagenFalla as borrarImagenFallaService } from './imagenService';
import { compressImage, formatBytes } from '../../hooks/useImageCompressor';
import { getFallaColor } from './fallaConstants';

const gravedadVariant = (g) => {
  if (g === 'Alta') return 'red';
  if (g === 'Media') return 'amber';
  return 'default';
};

export default function FallaCard({ falla, onDeleted, onImageUploaded }) {
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null); // { savedPercent, compressedSize } | null
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Image deletion states
  const [imageToDelete, setImageToDelete] = useState(null); // ID of the image to delete, opens modal
  const [deletingImage, setDeletingImage] = useState(false); // Loading state for modal
  const [toast, setToast] = useState({ message: '', type: '' });

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
    setError(null);

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
    } catch (err) {
      console.error('Error al subir imagen:', err);
      const serverError = err.response?.data?.error;
      const serverDetail = err.response?.data?.detalle;
      const message = serverError
        ? (serverDetail ? `${serverError}: ${serverDetail}` : serverError)
        : (err.message || 'Error desconocido al subir la imagen');
      setError(message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const confirmDeleteImage = async () => {
    if (!imageToDelete) return;
    setDeletingImage(true);
    try {
      await borrarImagenFallaService(imageToDelete);
      setToast({ message: 'Imagen eliminada correctamente', type: 'success' });
      onImageUploaded(); // Reusa el prop para refrescar los datos
    } catch (err) {
      console.error('Error al eliminar imagen:', err);
      const serverError = err.response?.data?.error;
      setToast({ message: serverError || 'Error al eliminar la imagen', type: 'error' });
    } finally {
      setDeletingImage(false);
      setImageToDelete(null);
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
            <Badge variant={getFallaColor(falla.categoria_falla)}>{falla.categoria_falla}</Badge>
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

      {/* Feedback de error */}
      {error && (
        <div className="mb-3 bg-red-500/10 border border-red-500/30 px-3 py-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-red-400 text-xs">✗</span>
            <p className="text-red-400 font-mono text-xs">
              {error}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-300 text-xs font-mono px-1 font-bold cursor-pointer"
          >
            ×
          </button>
        </div>
      )}

      {/* Imágenes */}
      {falla.imagenes?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {falla.imagenes.map((img) => (
            <div key={img.id} className="relative group">
              <a href={img.url_imagen} target="_blank" rel="noreferrer">
                <img
                  src={img.url_imagen}
                  alt="falla"
                  className="w-16 h-16 md:w-20 md:h-20 object-cover border border-zinc-700 group-hover:border-amber-500 transition-colors rounded"
                />
              </a>
              <button
                type="button"
                onClick={() => setImageToDelete(img.id)}
                className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-400 text-white rounded-full w-5 h-5 md:w-6 md:h-6 flex items-center justify-center text-xs md:text-sm shadow-md opacity-90 hover:opacity-100 transition-all active:scale-95"
                title="Eliminar imagen"
              >
                ✕
              </button>
            </div>
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

      {/* Modal para Confirmar Eliminación de Imagen */}
      <Modal
        isOpen={!!imageToDelete}
        onClose={() => !deletingImage && setImageToDelete(null)}
        title="Eliminar Imagen"
      >
        <div className="flex flex-col gap-4">
          <p className="text-zinc-300 font-mono text-sm">
            ¿Estás seguro de que deseas eliminar esta imagen de forma permanente? Esta acción no se puede deshacer.
          </p>
          <div className="flex justify-end gap-3 mt-2">
            <Button
              variant="ghost"
              onClick={() => setImageToDelete(null)}
              disabled={deletingImage}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={confirmDeleteImage}
              disabled={deletingImage}
              className="flex items-center gap-2"
            >
              {deletingImage ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                  Eliminando...
                </>
              ) : (
                'Eliminar'
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: '' })}
      />
    </div>
  );
}