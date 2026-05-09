/**
 * useImageCompressor
 *
 * Comprime una imagen en el browser antes de subirla al servidor.
 *
 * Estrategia:
 *  1. Dibuja la imagen en un <canvas> redimensionada a MAX_DIMENSION en el lado mayor.
 *  2. Intenta exportar como WebP (30-40% más liviano que JPEG). Si el browser
 *     no soporta WebP, cae a JPEG.
 *  3. Si el resultado comprimido pesa MÁS que el original (imagen ya optimizada),
 *     devuelve el archivo original para no empeorar la calidad.
 *
 * Resultados típicos en fotos de celular:
 *  - Foto original:   3-8 MB  (JPEG 4000x3000 px)
 *  - Resultado WebP:  150-400 KB  (1920px max, calidad 0.82)
 *  - Ahorro:          ~90-95%
 */

const MAX_DIMENSION = 1920; // px — lado mayor máximo
const QUALITY = 0.82;       // 0-1 — calidad de compresión

/**
 * Carga un File/Blob como HTMLImageElement.
 * @param {File} file
 * @returns {Promise<HTMLImageElement>}
 */
function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('No se pudo cargar la imagen'));
    };
    img.src = url;
  });
}

/**
 * Calcula las dimensiones de salida manteniendo el aspecto y
 * respetando MAX_DIMENSION.
 * @param {number} w - ancho original
 * @param {number} h - alto original
 * @returns {{ width: number, height: number }}
 */
function calcDimensions(w, h) {
  if (w <= MAX_DIMENSION && h <= MAX_DIMENSION) {
    return { width: w, height: h }; // ya es pequeña, no escalar
  }
  const ratio = Math.min(MAX_DIMENSION / w, MAX_DIMENSION / h);
  return {
    width: Math.round(w * ratio),
    height: Math.round(h * ratio),
  };
}

/**
 * Detecta si el browser soporta exportar WebP desde canvas.
 * Se cachea en módulo para no repetir el test.
 */
let _webpSupported = null;
function supportsWebP() {
  if (_webpSupported !== null) return _webpSupported;
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    _webpSupported = canvas.toDataURL('image/webp').startsWith('data:image/webp');
  } catch {
    _webpSupported = false;
  }
  return _webpSupported;
}

/**
 * Convierte un canvas a Blob.
 * @param {HTMLCanvasElement} canvas
 * @param {string} mimeType
 * @param {number} quality
 * @returns {Promise<Blob>}
 */
function canvasToBlob(canvas, mimeType, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('toBlob devolvió null'));
      },
      mimeType,
      quality
    );
  });
}

/**
 * Función principal de compresión.
 *
 * @param {File} file - archivo de imagen original
 * @returns {Promise<{ file: File, originalSize: number, compressedSize: number, savedPercent: number }>}
 */
export async function compressImage(file) {
  // Solo procesar imágenes
  if (!file.type.startsWith('image/')) {
    return {
      file,
      originalSize: file.size,
      compressedSize: file.size,
      savedPercent: 0,
    };
  }

  const img = await loadImage(file);
  const { width, height } = calcDimensions(img.naturalWidth, img.naturalHeight);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');

  // Fondo blanco para imágenes PNG con transparencia que se conviertan a JPEG
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);

  // Intentar WebP primero, caer a JPEG
  const mimeType = supportsWebP() ? 'image/webp' : 'image/jpeg';
  const extension = mimeType === 'image/webp' ? 'webp' : 'jpg';

  const compressedBlob = await canvasToBlob(canvas, mimeType, QUALITY);

  // Si el comprimido es más grande que el original, usar el original
  if (compressedBlob.size >= file.size) {
    return {
      file,
      originalSize: file.size,
      compressedSize: file.size,
      savedPercent: 0,
    };
  }

  // Construir nombre de archivo con nueva extensión
  const originalName = file.name.replace(/\.[^/.]+$/, '');
  const compressedFile = new File(
    [compressedBlob],
    `${originalName}.${extension}`,
    { type: mimeType, lastModified: Date.now() }
  );

  const savedPercent = Math.round((1 - compressedBlob.size / file.size) * 100);

  return {
    file: compressedFile,
    originalSize: file.size,
    compressedSize: compressedBlob.size,
    savedPercent,
  };
}

/**
 * Formatea bytes a string legible: "2.3 MB", "450 KB", etc.
 * @param {number} bytes
 * @returns {string}
 */
export function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}