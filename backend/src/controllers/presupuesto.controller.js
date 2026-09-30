import PDFDocument from 'pdfkit';
import * as presupuestoService from '../services/presupuesto.service.js';
import { formatCLP, formatCantidad, procesarItemizadoNCh1156 } from '../utils/nch1156.js';

export const listarPresupuestos = async (req, res) => {
  try {
    const id_usuario = req.usuario?.id;
    const lista = await presupuestoService.listarPresupuestos(id_usuario);
    res.status(200).json(lista);
  } catch (error) {
    res.status(500).json({ error: 'Error al listar presupuestos', detalle: error.message });
  }
};

export const obtenerPresupuestoPorId = async (req, res) => {
  try {
    const id_usuario = req.usuario?.id;
    const { id } = req.params;
    const presupuesto = await presupuestoService.obtenerPresupuestoPorId(id, id_usuario);
    res.status(200).json(presupuesto);
  } catch (error) {
    if (error.message === 'PRESUPUESTO_NO_ENCONTRADO') {
      return res.status(404).json({ error: 'Presupuesto no encontrado' });
    }
    res.status(500).json({ error: 'Error al obtener presupuesto', detalle: error.message });
  }
};

export const crearPresupuesto = async (req, res) => {
  try {
    const id_usuario = req.usuario?.id || 1;
    const nuevo = await presupuestoService.crearPresupuesto(id_usuario, req.body);
    res.status(201).json({ mensaje: 'Presupuesto creado con éxito', presupuesto: nuevo });
  } catch (error) {
    if (error.detalleErrores) {
      return res.status(400).json({
        error: 'Error de validación NCh 1156',
        detalle: error.message,
        errores: error.detalleErrores
      });
    }
    if (error.message === 'CAMPOS_REQUERIDOS_FALTANTES') {
      return res.status(400).json({ error: 'Nombre del proyecto, mandante, contratista y ubicación son obligatorios.' });
    }
    res.status(500).json({ error: 'Error al crear presupuesto', detalle: error.message });
  }
};

export const actualizarPresupuesto = async (req, res) => {
  try {
    const id_usuario = req.usuario?.id;
    const { id } = req.params;
    const actualizado = await presupuestoService.actualizarPresupuesto(id, id_usuario, req.body);
    res.status(200).json({ mensaje: 'Presupuesto actualizado con éxito', presupuesto: actualizado });
  } catch (error) {
    if (error.detalleErrores) {
      return res.status(400).json({
        error: 'Error de validación NCh 1156',
        detalle: error.message,
        errores: error.detalleErrores
      });
    }
    if (error.message === 'PRESUPUESTO_NO_ENCONTRADO') {
      return res.status(404).json({ error: 'Presupuesto no encontrado' });
    }
    res.status(500).json({ error: 'Error al actualizar presupuesto', detalle: error.message });
  }
};

export const eliminarPresupuesto = async (req, res) => {
  try {
    const id_usuario = req.usuario?.id;
    const { id } = req.params;
    await presupuestoService.eliminarPresupuesto(id, id_usuario);
    res.status(200).json({ mensaje: 'Presupuesto eliminado con éxito' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar presupuesto', detalle: error.message });
  }
};

export const calcularItemizado = async (req, res) => {
  try {
    const { items = [], porcentaje_gg = 10, porcentaje_util = 10 } = req.body;
    const resultado = procesarItemizadoNCh1156(items, porcentaje_gg, porcentaje_util);
    res.status(200).json(resultado);
  } catch (error) {
    res.status(400).json({ error: 'Error al calcular itemizado', detalle: error.message });
  }
};

export const obtenerPlantillas = (req, res) => {
  try {
    const plantillas = presupuestoService.obtenerPlantillas();
    res.status(200).json(plantillas);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener plantillas', detalle: error.message });
  }
};

/**
 * Generador de PDF oficial estándar chileno (NCh 1156 / MINVU / MOP)
 */
export const generarPdfPresupuesto = async (req, res) => {
  try {
    const id_usuario = req.usuario?.id;
    const id = req.params?.id;

    let p;
    // Si se pasa body con datos completos (preview directo), se utiliza; de lo contrario se busca en BD
    if (req.method === 'POST' && req.body && req.body.nombre_proyecto) {
      const calculo = procesarItemizadoNCh1156(req.body.items, req.body.porcentaje_gg, req.body.porcentaje_util);
      p = {
        ...req.body,
        items: calculo.items,
        totales: calculo.totales
      };
    } else {
      p = await presupuestoService.obtenerPresupuestoPorId(id, id_usuario);
    }

    const filename = `Presupuesto-NCh1156-${String(p.id || 'BORRADOR')}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);

    const doc = new PDFDocument({
      size: 'LETTER',
      margins: { top: 36, bottom: 36, left: 36, right: 36 },
      bufferPages: true
    });

    doc.pipe(res);

    // Paleta gráfica formal de ingeniería chilena
    const primary = '#1e293b'; // Slate 800
    const amberAccent = '#d97706'; // Amber 600
    const textDark = '#18181b'; // Zinc 900
    const textMuted = '#52525b'; // Zinc 600
    const tableHeaderBg = '#0f172a'; // Slate 900
    const zebraBg = '#f8fafc'; // Slate 50
    const titleRowBg = '#f1f5f9'; // Slate 100
    const borderGray = '#cbd5e1'; // Slate 300

    const pageWidth = doc.page.width;
    const marginLeft = 36;
    const marginRight = 36;
    const contentWidth = pageWidth - marginLeft - marginRight; // 612 - 72 = 540 pt

    // Funciones auxiliares de dibujo
    const drawHeader = () => {
      // Franja superior de acento
      doc.rect(marginLeft, doc.y, contentWidth, 3).fill(amberAccent);
      doc.y += 8;

      // Encabezado institucional
      doc.font('Helvetica-Bold').fontSize(14).fillColor(primary)
        .text('ITEMIZADO OFICIAL — PRESUPUESTO POR PARTIDAS', marginLeft, doc.y, { align: 'center', width: contentWidth });
      doc.font('Helvetica').fontSize(9).fillColor(textMuted)
        .text('Conforme a Norma Chilena Oficial NCh 1156 • Estándares Técnicos MINVU / MOP', marginLeft, doc.y + 2, { align: 'center', width: contentWidth });

      doc.y += 14;

      // Cuadro de antecedentes del proyecto
      const boxY = doc.y;
      const boxH = 58;
      doc.rect(marginLeft, boxY, contentWidth, boxH).fillAndStroke('#f8fafc', borderGray);

      const col1X = marginLeft + 10;
      const col2X = marginLeft + (contentWidth / 2) + 10;
      let textY = boxY + 8;

      const fechaStr = p.fecha ? new Date(p.fecha).toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' }) : new Date().toLocaleDateString('es-CL');

      // Columna 1
      doc.fontSize(8.5).font('Helvetica-Bold').fillColor(primary).text('PROYECTO: ', col1X, textY, { continued: true })
        .font('Helvetica').fillColor(textDark).text(p.nombre_proyecto || 'Sin Nombre');

      doc.fontSize(8.5).font('Helvetica-Bold').fillColor(primary).text('MANDANTE: ', col1X, textY + 16, { continued: true })
        .font('Helvetica').fillColor(textDark).text(p.mandante || 'No especificado');

      doc.fontSize(8.5).font('Helvetica-Bold').fillColor(primary).text('UBICACIÓN: ', col1X, textY + 32, { continued: true })
        .font('Helvetica').fillColor(textDark).text(p.ubicacion || 'No especificada');

      // Columna 2
      doc.fontSize(8.5).font('Helvetica-Bold').fillColor(primary).text('CONTRATISTA: ', col2X, textY, { continued: true })
        .font('Helvetica').fillColor(textDark).text(p.contratista || 'No especificado');

      doc.fontSize(8.5).font('Helvetica-Bold').fillColor(primary).text('FECHA EMISIÓN: ', col2X, textY + 16, { continued: true })
        .font('Helvetica').fillColor(textDark).text(fechaStr);

      doc.fontSize(8.5).font('Helvetica-Bold').fillColor(primary).text('DOCUMENTO: ', col2X, textY + 32, { continued: true })
        .font('Helvetica').fillColor(amberAccent).text(`FOLIO ITM-${String(p.id || '001').padStart(4, '0')}`);

      doc.y = boxY + boxH + 12;
    };

    // Anchos de columnas de la tabla NCh 1156 (Total: 540 pt)
    const cols = {
      item: { x: marginLeft, w: 45 },
      desc: { x: marginLeft + 45, w: 225 },
      unid: { x: marginLeft + 270, w: 45 },
      cant: { x: marginLeft + 315, w: 60 },
      pu:   { x: marginLeft + 375, w: 75 },
      tot:  { x: marginLeft + 450, w: 90 }
    };

    const drawTableHead = (currentY) => {
      const h = 20;
      doc.rect(marginLeft, currentY, contentWidth, h).fill(tableHeaderBg);
      doc.font('Helvetica-Bold').fontSize(8).fillColor('#ffffff');

      doc.text('ÍTEM', cols.item.x + 4, currentY + 6, { width: cols.item.w - 8, align: 'center' });
      doc.text('DESCRIPCIÓN DE LA PARTIDA', cols.desc.x + 6, currentY + 6, { width: cols.desc.w - 10, align: 'left' });
      doc.text('UNIDAD', cols.unid.x, currentY + 6, { width: cols.unid.w, align: 'center' });
      doc.text('CANTIDAD', cols.cant.x, currentY + 6, { width: cols.cant.w - 6, align: 'right' });
      doc.text('P. UNITARIO ($)', cols.pu.x, currentY + 6, { width: cols.pu.w - 6, align: 'right' });
      doc.text('TOTAL ($)', cols.tot.x, currentY + 6, { width: cols.tot.w - 8, align: 'right' });

      return currentY + h;
    };

    // Renderizar encabezado inicial
    drawHeader();
    let currentY = drawTableHead(doc.y);

    const items = p.items || [];
    const totales = p.totales || {};

    const bottomMarginLimit = doc.page.height - 180; // Espacio reservado para pie financiero

    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      const isTitulo = it.nivel === 1;

      // Medir altura de la fila según la descripción
      doc.font(isTitulo ? 'Helvetica-Bold' : 'Helvetica').fontSize(isTitulo ? 8.5 : 8);
      const textH = doc.heightOfString(it.descripcion || '', { width: cols.desc.w - 12 });
      const rowHeight = Math.max(isTitulo ? 18 : 16, textH + 8);

      // Comprobar si cabe en la página actual
      if (currentY + rowHeight > doc.page.height - 40) {
        doc.addPage();
        currentY = 40;
        currentY = drawTableHead(currentY);
      }

      // Fondo de la fila
      if (isTitulo) {
        doc.rect(marginLeft, currentY, contentWidth, rowHeight).fill(titleRowBg);
        doc.rect(marginLeft, currentY, contentWidth, 0.5).stroke(borderGray);
        doc.rect(marginLeft, currentY + rowHeight, contentWidth, 0.5).stroke(borderGray);
      } else if (i % 2 === 1) {
        doc.rect(marginLeft, currentY, contentWidth, rowHeight).fill(zebraBg);
      }

      // Dibujar línea inferior sutil
      doc.rect(marginLeft, currentY + rowHeight, contentWidth, 0.5).stroke('#e2e8f0');

      // Textos
      const textBaselineY = currentY + 4;

      if (isTitulo) {
        doc.font('Helvetica-Bold').fontSize(8.5).fillColor(primary);
        doc.text(it.codigo || '', cols.item.x + 4, textBaselineY, { width: cols.item.w - 8, align: 'center' });
        doc.text(it.descripcion || '', cols.desc.x + 6, textBaselineY, { width: cols.desc.w - 10, align: 'left' });
        // En nivel 1: sin unidad ni P.U., solo subtotal en Total ($)
        doc.text(formatCLP(it.total), cols.tot.x, textBaselineY, { width: cols.tot.w - 8, align: 'right' });
      } else {
        doc.font('Helvetica').fontSize(8).fillColor(textDark);
        doc.text(it.codigo || '', cols.item.x + 4, textBaselineY, { width: cols.item.w - 8, align: 'center' });
        doc.text(it.descripcion || '', cols.desc.x + 12, textBaselineY, { width: cols.desc.w - 16, align: 'left' });
        doc.font('Helvetica-Bold').fillColor(textMuted).text(it.unidad || '', cols.unid.x, textBaselineY, { width: cols.unid.w, align: 'center' });
        doc.font('Helvetica').fillColor(textDark).text(formatCantidad(it.cantidad), cols.cant.x, textBaselineY, { width: cols.cant.w - 6, align: 'right' });
        doc.text(formatCLP(it.precio_unitario), cols.pu.x, textBaselineY, { width: cols.pu.w - 6, align: 'right' });
        doc.font('Helvetica-Bold').text(formatCLP(it.total), cols.tot.x, textBaselineY, { width: cols.tot.w - 8, align: 'right' });
      }

      currentY += rowHeight;
    }

    // Comprobar espacio para el pie financiero
    if (currentY + 160 > doc.page.height - 36) {
      doc.addPage();
      currentY = 40;
    }

    currentY += 8;

    // ==========================================
    // CIERRE FINANCIERO (PIE DEL PRESUPUESTO)
    // Alineado a la derecha en orden estricto NCh 1156
    // ==========================================
    const summaryW = 230;
    const summaryX = marginLeft + contentWidth - summaryW;
    const summaryY = currentY;

    // Caja de cierre financiero
    doc.rect(summaryX, summaryY, summaryW, 114).fillAndStroke('#f8fafc', borderGray);

    let lineY = summaryY + 8;
    const labelW = 120;
    const valW = 95;
    const labelX = summaryX + 10;
    const valX = summaryX + labelW;

    const printFinanceRow = (label, value, isBold = false, isHighlight = false, color = primary) => {
      doc.font(isBold ? 'Helvetica-Bold' : 'Helvetica')
        .fontSize(isBold ? 9 : 8.5)
        .fillColor(color);

      doc.text(label, labelX, lineY, { width: labelW, align: 'left' });
      doc.text(value, valX, lineY, { width: valW, align: 'right' });

      lineY += 16;
    };

    const cd = totales.costoDirecto || 0;
    const ggPct = totales.porcentajeGG || 10;
    const gg = totales.gastosGenerales || Math.round(cd * (ggPct / 100));
    const utilPct = totales.porcentajeUtil || 10;
    const util = totales.utilidades || Math.round(cd * (utilPct / 100));
    const neto = totales.valorNeto || (cd + gg + util);
    const iva = totales.iva || Math.round(neto * 0.19);
    const total = totales.totalPresupuesto || (neto + iva);

    printFinanceRow('Costo Directo (CD):', formatCLP(cd), false, false, textDark);
    printFinanceRow(`Gastos Generales (${ggPct}%):`, formatCLP(gg), false, false, textDark);
    printFinanceRow(`Utilidades (${utilPct}%):`, formatCLP(util), false, false, textDark);

    // Línea divisoria
    doc.rect(summaryX + 10, lineY - 3, summaryW - 20, 0.5).stroke(borderGray);

    printFinanceRow('VALOR NETO:', formatCLP(neto), true, false, primary);
    printFinanceRow('I.V.A. (19%):', formatCLP(iva), false, false, textDark);

    // Destacado Total
    doc.rect(summaryX, lineY - 2, summaryW, 22).fill(tableHeaderBg);
    doc.font('Helvetica-Bold').fontSize(10).fillColor('#ffffff');
    doc.text('TOTAL PRESUPUESTO:', labelX, lineY + 3, { width: labelW, align: 'left' });
    doc.fillColor(amberAccent).text(formatCLP(total), valX, lineY + 3, { width: valW, align: 'right' });

    // Cuadro de firmas legales / de obra al pie
    const firmasY = summaryY + 128;
    if (firmasY + 60 <= doc.page.height - 30) {
      const firmaW = 190;
      const firma1X = marginLeft + 30;
      const firma2X = marginLeft + contentWidth - firmaW - 30;

      doc.rect(firma1X, firmasY + 30, firmaW, 0.75).stroke(primary);
      doc.font('Helvetica-Bold').fontSize(8).fillColor(primary)
        .text('CONSTRUCTOR / CONTRATISTA', firma1X, firmasY + 34, { width: firmaW, align: 'center' });
      doc.font('Helvetica').fontSize(7.5).fillColor(textMuted)
        .text('Firma y RUT Responsable', firma1X, firmasY + 44, { width: firmaW, align: 'center' });

      doc.rect(firma2X, firmasY + 30, firmaW, 0.75).stroke(primary);
      doc.font('Helvetica-Bold').fontSize(8).fillColor(primary)
        .text('MANDANTE / PROPIETARIO', firma2X, firmasY + 34, { width: firmaW, align: 'center' });
      doc.font('Helvetica').fontSize(7.5).fillColor(textMuted)
        .text('Aceptación de Presupuesto', firma2X, firmasY + 44, { width: firmaW, align: 'center' });
    }

    // Numeración de páginas en el pie
    const pageRange = doc.bufferedPageRange();
    for (let pIdx = 0; pIdx < pageRange.count; pIdx++) {
      doc.switchToPage(pIdx);
      doc.font('Helvetica').fontSize(7).fillColor(textMuted)
        .text(`Inspect App • NCh 1156 Itemizado Oficial • Página ${pIdx + 1} de ${pageRange.count}`, marginLeft, doc.page.height - 24, {
          width: contentWidth,
          align: 'center'
        });
    }

    doc.end();
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({ error: 'Error al generar PDF del presupuesto', detalle: error.message });
    }
  }
};
