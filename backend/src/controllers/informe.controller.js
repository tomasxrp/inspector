import * as informeService from '../services/informe.service.js';

export const crearInforme = async (req, res) => {
    try {
        const { id_revision, veredicto_final, observaciones_cliente, url_pdf } = req.body;

        if (!id_revision || !veredicto_final || !observaciones_cliente) {
            return res.status(400).json({ error: 'Faltan campos obligatorios' });
        }

        const nuevoInforme = await informeService.crearInforme(parseInt(id_revision, 10), {
            veredicto_final,
            observaciones_cliente,
            url_pdf
        });

        res.status(201).json({ mensaje: 'Informe generado con éxito', informe: nuevoInforme });
    } catch (error) {
        if (error.message === 'REVISION_NO_ENCONTRADA') {
            return res.status(404).json({ error: 'La revisión asociada no existe' });
        }
        if (error.message === 'INFORME_YA_EXISTE') {
            return res.status(409).json({ error: 'Esta revisión ya tiene un informe oficial emitido' });
        }
        res.status(500).json({ error: 'Error al crear el informe', detalle: error.message });
    }
};

export const obtenerInformePorRevision = async (req, res) => {
    try {
        const id_revision = parseInt(req.params.id_revision, 10);
        const informe = await informeService.obtenerInformeCompleto(id_revision);
        res.status(200).json(informe);
    } catch (error) {
        if (error.message === 'INFORME_NO_ENCONTRADO') {
            return res.status(404).json({ error: 'No se encontró un informe para esta revisión' });
        }
        res.status(500).json({ error: 'Error al obtener el informe', detalle: error.message });
    }
};

export const actualizarInforme = async (req, res) => {
    try {
        const id_revision = parseInt(req.params.id_revision, 10);
        const { veredicto_final, observaciones_cliente, url_pdf } = req.body;

        const informeActualizado = await informeService.actualizarInforme(id_revision, {
            veredicto_final,
            observaciones_cliente,
            url_pdf
        });

        res.status(200).json({ mensaje: 'Informe actualizado', informe: informeActualizado });
    } catch (error) {
        if (error.message === 'INFORME_NO_ENCONTRADO') {
            return res.status(404).json({ error: 'El informe no existe' });
        }
        res.status(500).json({ error: 'Error al actualizar el informe', detalle: error.message });
    }
};

/**
 * GET /api/informes/revision/:id_revision/pdf
 * Generates a PDF report using only Node built-ins (no extra deps).
 * Returns the PDF as a binary stream (application/pdf).
 */
export const generarPdfInforme = async (req, res) => {
    try {
        const id_revision = parseInt(req.params.id_revision, 10);
        const informe = await informeService.obtenerInformeCompleto(id_revision);

        const pdfBuffer = buildPdf(informe);

        const filename = `informe-FOL-${String(id_revision).padStart(4, '0')}.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', pdfBuffer.length);
        res.end(pdfBuffer);
    } catch (error) {
        if (error.message === 'INFORME_NO_ENCONTRADO') {
            return res.status(404).json({ error: 'No se encontró un informe para esta revisión' });
        }
        res.status(500).json({ error: 'Error al generar el PDF', detalle: error.message });
    }
};

/* ─────────────────────────────────────────────────────────────
   Minimal hand-rolled PDF builder  (zero dependencies)
   Produces a valid, readable PDF 1.4 document.
───────────────────────────────────────────────────────────── */
function buildPdf(informe) {
    const rev   = informe.revision;
    const prop  = rev?.propiedad  ?? {};
    const cli   = prop?.cliente   ?? {};
    const fallas = rev?.fallas    ?? [];

    const folio  = `FOL-${String(informe.id_revision).padStart(4, '0')}`;
    const fecha  = new Date(informe.fecha_emision).toLocaleDateString('es-CL', {
        day: '2-digit', month: 'long', year: 'numeric'
    });
    const fechaRev = rev?.fecha_revision
        ? new Date(rev.fecha_revision).toLocaleDateString('es-CL', {
              day: '2-digit', month: 'long', year: 'numeric'
          })
        : '—';

    // Count faults by severity
    const alta  = fallas.filter(f => f.nivel_gravedad === 'Alta').length;
    const media = fallas.filter(f => f.nivel_gravedad === 'Media').length;
    const baja  = fallas.filter(f => f.nivel_gravedad === 'Baja').length;

    // ── helpers ──────────────────────────────────────────────
    const objects = [];
    const offsets = [];
    let   buf     = '';

    const esc  = s => String(s ?? '—')
        .replace(/\\/g, '\\\\')
        .replace(/\(/g, '\\(')
        .replace(/\)/g, '\\)')
        // strip non-Latin1 characters (PDF std string encoding)
        .replace(/[^\x20-\x7E\xA0-\xFF]/g, '?');

    const addObj = (content) => {
        objects.push(content);
        return objects.length; // 1-based id
    };

    // ── PDF objects ──────────────────────────────────────────
    // 1 – Catalog
    addObj('<< /Type /Catalog /Pages 2 0 R >>');

    // 2 – Pages (placeholder, patched later)
    addObj('<< /Type /Pages /Kids [3 0 R] /Count 1 >>');

    // ── content stream ───────────────────────────────────────
    const lines = [];
    const LH = 16; // line height pt
    const ML = 50; // left margin
    const PW = 595; // page width  (A4)
    const PH = 842; // page height (A4)

    let y = PH - 60;

    const text = (x, yPos, size, txt) =>
        lines.push(`BT /F1 ${size} Tf ${x} ${yPos} Td (${esc(txt)}) Tj ET`);

    const hline = (yPos) =>
        lines.push(`${ML} ${yPos} m ${PW - ML} ${yPos} l S`);

    const box = (x, yy, w, h) =>
        lines.push(`${x} ${yy} ${w} ${h} re S`);

    // Header bar
    lines.push('0.18 0.18 0.18 rg');
    lines.push(`${ML - 10} ${y - 10} ${PW - 2 * (ML - 10)} 50 re f`);
    lines.push('0.98 0.6 0.13 rg');
    lines.push(`${ML - 10} ${y - 10} 6 50 re f`);
    lines.push('1 1 1 rg');
    text(ML + 4, y + 18, 20, 'INFORME DE INSPECCION');
    text(ML + 4, y + 2,  10, `Inspect App  -  Folio: ${folio}`);
    lines.push('0 0 0 rg');

    y -= 30;
    text(ML, y, 9, `Fecha de emision: ${fecha}`);
    y -= LH;
    text(ML, y, 9, `Fecha de revision: ${fechaRev}`);
    y -= LH * 1.5;
    hline(y + 4);

    // Section: Propiedad & Cliente
    y -= LH;
    lines.push('0.95 0.38 0.08 rg');
    text(ML, y, 11, 'DATOS DE LA PROPIEDAD');
    lines.push('0 0 0 rg');
    y -= LH * 1.2;

    const row = (label, value) => {
        text(ML, y, 9, `${label}: ${value}`);
        y -= LH;
    };

    row('Direccion',    `${prop.direccion ?? '—'}, ${prop.comuna ?? '—'}`);
    row('Tipo',         prop.tipo_propiedad ?? '—');
    row('Cliente',      `${cli.nombre ?? '—'} ${cli.apellido ?? ''}`);
    row('Correo',       cli.correo   ?? '—');
    row('Telefono',     cli.telefono ?? '—');
    row('Inspector',    rev?.usuario ? `${rev.usuario.nombre} ${rev.usuario.apellido}` : '—');

    y -= LH * 0.5;
    hline(y + 4);
    y -= LH;

    // Section: Veredicto
    lines.push('0.95 0.38 0.08 rg');
    text(ML, y, 11, 'VEREDICTO FINAL');
    lines.push('0 0 0 rg');
    y -= LH * 1.2;
    text(ML, y, 10, informe.veredicto_final);
    y -= LH * 1.5;
    hline(y + 4);

    // Section: Summary counts
    y -= LH;
    lines.push('0.95 0.38 0.08 rg');
    text(ML, y, 11, 'RESUMEN DE FALLAS');
    lines.push('0 0 0 rg');
    y -= LH * 1.2;
    text(ML,       y, 9, `Total de fallas registradas: ${fallas.length}`);
    y -= LH;
    lines.push('0.8 0.1 0.1 rg');
    text(ML,       y, 9, `Gravedad Alta:  ${alta}`);
    lines.push('0.8 0.5 0.0 rg');
    text(ML + 130, y, 9, `Gravedad Media: ${media}`);
    lines.push('0.3 0.3 0.3 rg');
    text(ML + 260, y, 9, `Gravedad Baja:  ${baja}`);
    lines.push('0 0 0 rg');
    y -= LH * 1.5;
    hline(y + 4);

    // Section: Faults list (max ~20 to keep on one page)
    if (fallas.length > 0) {
        y -= LH;
        lines.push('0.95 0.38 0.08 rg');
        text(ML, y, 11, 'DETALLE DE FALLAS');
        lines.push('0 0 0 rg');
        y -= LH * 1.2;

        const shown = fallas.slice(0, 20);
        for (const f of shown) {
            if (y < 80) break; // avoid page overflow for now
            const gravLabel = f.nivel_gravedad === 'Alta'  ? '[ALTA] '
                            : f.nivel_gravedad === 'Media' ? '[MEDIA]'
                            :                                '[BAJA] ';
            const desc = String(f.descripcion ?? '').slice(0, 80);
            text(ML, y, 8.5, `${gravLabel}  ${f.categoria_falla}  -  ${desc}`);
            y -= LH;
        }
        if (fallas.length > 20) {
            text(ML, y, 8, `... y ${fallas.length - 20} falla(s) adicionales (ver sistema).`);
            y -= LH;
        }
        y -= LH * 0.5;
        hline(y + 4);
    }

    // Section: Observations
    if (informe.observaciones_cliente) {
        y -= LH;
        lines.push('0.95 0.38 0.08 rg');
        text(ML, y, 11, 'OBSERVACIONES PARA EL CLIENTE');
        lines.push('0 0 0 rg');
        y -= LH * 1.2;

        // wrap long text into ~85-char lines
        const words = String(informe.observaciones_cliente).split(' ');
        let line = '';
        for (const w of words) {
            if ((line + w).length > 85) {
                if (y < 80) break;
                text(ML, y, 8.5, line.trim());
                y -= LH;
                line = w + ' ';
            } else {
                line += w + ' ';
            }
        }
        if (line.trim() && y >= 80) {
            text(ML, y, 8.5, line.trim());
            y -= LH;
        }
    }

    // Footer
    lines.push('0.5 0.5 0.5 rg');
    text(ML, 30, 7.5, `Inspect App  |  Documento generado automaticamente  |  ${folio}  |  ${fecha}`);
    lines.push('0 0 0 rg');

    const streamContent = lines.join('\n');
    const streamBytes   = Buffer.from(streamContent, 'latin1');
    const streamLen     = streamBytes.length;

    // 3 – Content stream
    addObj(`<< /Length ${streamLen} >>\nstream\n${streamContent}\nendstream`);

    // 4 – Font (Helvetica — always embedded in PDF readers)
    addObj('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');

    // 5 – Resources
    addObj('<< /Font << /F1 4 0 R >> >>');

    // Patch Page object
    // 3 – Page
    addObj(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PW} ${PH}] /Contents 3 0 R /Resources 5 0 R >>`);

    // Patch Pages to point to page object (id 6)
    objects[1] = `<< /Type /Pages /Kids [6 0 R] /Count 1 >>`;

    // ── Assemble raw PDF bytes ────────────────────────────────
    let pdf = '%PDF-1.4\n';
    for (let i = 0; i < objects.length; i++) {
        offsets.push(pdf.length);
        pdf += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`;
    }

    const xrefOffset = pdf.length;
    pdf += `xref\n0 ${objects.length + 1}\n`;
    pdf += '0000000000 65535 f \n';
    for (const o of offsets) {
        pdf += String(o).padStart(10, '0') + ' 00000 n \n';
    }
    pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\n`;
    pdf += `startxref\n${xrefOffset}\n%%EOF\n`;

    return Buffer.from(pdf, 'latin1');
}