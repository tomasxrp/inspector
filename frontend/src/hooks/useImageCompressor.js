/**
 * useImageCompressor — safer version
 *
 * Changes vs original:
 * - MAX_DIMENSION lowered to 1280px (was 1920) — avoids OOM on low-end/mobile devices
 * - Files already ≤ 300 KB are returned as-is (no canvas overhead)
 * - canvas.toBlob() failures are caught and the original file is returned
 * - Canvas dimensions zeroed after use so GC can reclaim memory sooner
 */

const MAX_DIMENSION   = 1280;
const SIZE_THRESHOLD  = 300 * 1024; // 300 KB
const QUALITY         = 0.80;

function loadImage(file) {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload  = () => { URL.revokeObjectURL(url); resolve(img); };
        img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('No se pudo cargar la imagen')); };
        img.src = url;
    });
}

function calcDimensions(w, h) {
    if (w <= MAX_DIMENSION && h <= MAX_DIMENSION) return { width: w, height: h };
    const ratio = Math.min(MAX_DIMENSION / w, MAX_DIMENSION / h);
    return { width: Math.round(w * ratio), height: Math.round(h * ratio) };
}

let _webpSupported = null;
function supportsWebP() {
    if (_webpSupported !== null) return _webpSupported;
    try {
        const c = document.createElement('canvas');
        c.width = 1; c.height = 1;
        _webpSupported = c.toDataURL('image/webp').startsWith('data:image/webp');
    } catch { _webpSupported = false; }
    return _webpSupported;
}

function canvasToBlob(canvas, mimeType, quality) {
    return new Promise((resolve, reject) => {
        try {
            canvas.toBlob(
                (blob) => blob ? resolve(blob) : reject(new Error('toBlob returned null')),
                mimeType,
                quality
            );
        } catch (err) { reject(err); }
    });
}

export async function compressImage(file) {
    const noop = { file, originalSize: file.size, compressedSize: file.size, savedPercent: 0 };

    if (!file.type.startsWith('image/')) return noop;
    if (file.size <= SIZE_THRESHOLD)      return noop; // already small enough

    try {
        const img    = await loadImage(file);
        const { width, height } = calcDimensions(img.naturalWidth, img.naturalHeight);

        const canvas  = document.createElement('canvas');
        canvas.width  = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) return noop;

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        const mimeType  = supportsWebP() ? 'image/webp' : 'image/jpeg';
        const extension = mimeType === 'image/webp' ? 'webp' : 'jpg';

        const compressedBlob = await canvasToBlob(canvas, mimeType, QUALITY);

        // Release canvas memory ASAP
        canvas.width = 0; canvas.height = 0;

        if (compressedBlob.size >= file.size) return noop;

        const baseName       = file.name.replace(/\.[^/.]+$/, '');
        const compressedFile = new File(
            [compressedBlob],
            `${baseName}.${extension}`,
            { type: mimeType, lastModified: Date.now() }
        );

        const savedPercent = Math.round((1 - compressedBlob.size / file.size) * 100);
        return { file: compressedFile, originalSize: file.size, compressedSize: compressedBlob.size, savedPercent };
    } catch {
        return noop; // safe fallback — upload original on any error
    }
}

export function formatBytes(bytes) {
    if (bytes < 1024)        return `${bytes} B`;
    if (bytes < 1048576)     return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
}