import PDFDocument from 'pdfkit';
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

export const generarPdfInforme = async (req, res) => {
    try {
        const id_revision = parseInt(req.params.id_revision, 10);
        const informe = await informeService.obtenerInformeCompleto(id_revision);

        const filename = `informe-FOL-${String(id_revision).padStart(4, '0')}.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        const doc = new PDFDocument({ margin: 50, size: 'A4', bufferPages: true });
        doc.pipe(res);

        // --- Colors ---
        const primaryColor = '#1e293b'; // slate-800
        const accentColor = '#f59e0b'; // amber-500
        const textColor = '#3f3f46'; // zinc-700
        const lightBg = '#f4f4f5'; // zinc-100

        // TOC Data
        const toc = [];
        const addTocEntry = (title) => {
            toc.push({ title, page: doc.bufferedPageRange().count });
        };

        const rev = informe.revision;
        const prop = rev?.propiedad ?? {};
        const cli = prop?.cliente ?? {};
        const fallas = rev?.fallas ?? [];
        const folio = `FOL-${String(informe.id_revision).padStart(4, '0')}`;
        const fechaEmision = new Date(informe.fecha_emision).toLocaleDateString('es-CL');

        // --- 1. PORTADA (Page 0) ---
        doc.rect(0, 0, doc.page.width, doc.page.height).fill(primaryColor);
        // Decorative triangles
        doc.polygon([0, 0], [doc.page.width, 0], [doc.page.width, 250]).fill(accentColor);
        doc.polygon([0, doc.page.height], [doc.page.width, doc.page.height], [0, doc.page.height - 150]).fill(accentColor);

        doc.fillColor('#ffffff').fontSize(56).font('Helvetica-Bold').text('INSPECT', 0, 300, { align: 'center' });
        doc.fillColor('#ffffff').fontSize(40).font('Helvetica-Bold').text('APP', 0, 360, { align: 'center' });

        doc.fontSize(20).font('Helvetica').text('INFORME TÉCNICO DE INSPECCIÓN', 0, 450, { align: 'center' });
        doc.moveDown(3);
        doc.fontSize(16).fillColor(accentColor).font('Helvetica-Bold').text(`Folio: ${folio}`, { align: 'center' });
        doc.fontSize(14).fillColor('#ffffff').font('Helvetica').text(`Fecha de emisión: ${fechaEmision}`, { align: 'center' });

        // --- 2. ÍNDICE (Page 1) ---
        doc.addPage();
        const tocPageIndex = doc.bufferedPageRange().count - 1; // Save page index to draw later

        // --- 3. INFORMACIÓN GENERAL ---
        doc.addPage();
        addTocEntry('1. Información General');
        doc.fillColor(primaryColor).fontSize(20).font('Helvetica-Bold').text('1. Información General', 50, 60);
        doc.rect(50, 85, 495, 2).fill(accentColor);
        doc.y = 110;

        doc.fillColor(textColor).fontSize(12).font('Helvetica');
        const drawRow = (label, value) => {
            doc.font('Helvetica-Bold').fillColor(primaryColor).text(`${label}: `, { continued: true })
                .font('Helvetica').fillColor(textColor).text(value);
            doc.moveDown(0.8);
        };

        drawRow('Cliente', `${cli.nombre ?? ''} ${cli.apellido ?? ''}`);
        drawRow('Dirección', `${prop.direccion ?? 'N/A'}`);
        drawRow('Comuna', `${prop.comuna ?? 'N/A'}`);
        drawRow('Teléfono', `${cli.telefono ?? 'N/A'}`);
        drawRow('Tipo de Propiedad', `${prop.tipo_propiedad ?? 'N/A'}`);
        const fechaRev = rev?.fecha_revision ? new Date(rev.fecha_revision).toLocaleString('es-CL') : 'N/A';
        drawRow('Fecha/Hora de Inspección', fechaRev);
        drawRow('Inspector a cargo', rev?.usuario ? `${rev.usuario.nombre} ${rev.usuario.apellido}` : 'N/A');

        // --- 4. ALCANCES DE LA INSPECCIÓN ---
        doc.moveDown(2);
        addTocEntry('2. Alcances de la Inspección');
        doc.fillColor(primaryColor).fontSize(20).font('Helvetica-Bold').text('2. Alcances de la Inspección');
        doc.rect(50, doc.y + 5, 495, 2).fill(accentColor);
        doc.y += 20;

        doc.fillColor(textColor).fontSize(11).font('Helvetica')
            .text('La presente inspección tiene como objetivo evaluar el estado físico y funcional de la propiedad. Se realiza una revisión visual no invasiva de los siguientes elementos, siempre y cuando estén accesibles de forma segura:');
        doc.moveDown(0.5);

        const CATEGORIAS = [
            'Fisuras y grietas', 'Humedad y filtraciones', 'Instalación eléctrica',
            'Instalación sanitaria', 'Terminaciones', 'Estructura',
            'Cubiertas y techumbres', 'Ventanas y puertas', 'Otro'
        ];

        doc.font('Helvetica-Bold');
        CATEGORIAS.forEach(c => doc.text(`• ${c}`, { indent: 20 }));

        doc.moveDown(1);
        doc.font('Helvetica-Bold').fillColor('#ef4444').text('Áreas excluidas: ', { continued: true })
            .font('Helvetica').fillColor(textColor)
            .text('Quedan estrictamente excluidas de esta revisión las áreas inaccesibles, sistemas de energía solar, piscinas, sistemas de climatización complejos, electrodomésticos y pruebas invasivas estructurales o de mecánica de suelo.');

        // --- 5. SIMBOLOGÍA ---
        doc.addPage();
        addTocEntry('3. Simbología');
        doc.fillColor(primaryColor).fontSize(20).font('Helvetica-Bold').text('3. Simbología', 50, 60);
        doc.rect(50, 85, 495, 2).fill(accentColor);
        doc.y = 110;

        doc.fontSize(14).font('Helvetica-Bold').text('Veredictos de Inspección');
        doc.moveDown(0.5);
        doc.fontSize(11).font('Helvetica').fillColor(textColor);
        const VEREDICTOS = [
            'Aprobado sin observaciones',
            'Aprobado con observaciones menores',
            'Aprobado con condiciones',
            'Rechazado — requiere reparaciones',
            'Rechazado — fallas estructurales críticas'
        ];
        VEREDICTOS.forEach(v => {
            doc.text(`• ${v}`, { indent: 10 });
            doc.moveDown(0.3);
        });

        doc.moveDown(1);
        doc.fontSize(14).font('Helvetica-Bold').fillColor(primaryColor).text('Gravedad de Fallas');
        doc.moveDown(0.5);

        const drawSeverity = (color, title, desc) => {
            doc.rect(50, doc.y, 15, 15).fill(color);
            doc.fillColor(primaryColor).font('Helvetica-Bold').fontSize(11).text(title, 75, doc.y + 2, { continued: true })
                .font('Helvetica').fillColor(textColor).text(`: ${desc}`);
            doc.moveDown(0.8);
        };
        drawSeverity('#ef4444', 'Alta', 'Riesgo inminente o estructural, requiere reparación urgente.');
        drawSeverity('#f59e0b', 'Media', 'Falla funcional o estética importante que debe corregirse.');
        drawSeverity('#71717a', 'Baja', 'Observación estética menor o preventiva.');

        // --- 6. RESUMEN DE FALLAS (TABLA) ---
        doc.addPage();
        addTocEntry('4. Resumen de Fallas');
        doc.fillColor(primaryColor).fontSize(20).font('Helvetica-Bold').text('4. Resumen de Fallas', 50, 60);
        doc.rect(50, 85, 495, 2).fill(accentColor);
        doc.y = 110;

        if (fallas.length === 0) {
            doc.fontSize(12).font('Helvetica').fillColor(textColor).text('No se registraron fallas en esta inspección.');
        } else {
            // Table Header
            doc.rect(50, doc.y, 495, 25).fill(primaryColor);
            doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(10);
            doc.text('N°', 60, doc.y + 7);
            doc.text('G', 90, doc.y - 10); // Gravedad
            doc.text('Descripción y Categoría', 115, doc.y - 10);
            doc.text('Registro Fotográfico', 330, doc.y - 10);

            doc.y += 18; // Move below header

            const colNum = 60;
            const colGrav = 85;
            const colDesc = 115;
            const colImg = 330;
            const imgW = 205;
            const rowHeight = 100;

            for (let i = 0; i < fallas.length; i++) {
                const f = fallas[i];

                // Add page if row won't fit
                if (doc.y > doc.page.height - 130) {
                    doc.addPage();
                    doc.y = 50;
                }

                const yTop = doc.y;

                // Alternate background
                if (i % 2 === 0) {
                    doc.rect(50, yTop, 495, rowHeight).fill(lightBg);
                }

                // Number
                doc.fillColor(primaryColor).font('Helvetica-Bold').fontSize(10);
                doc.text((i + 1).toString(), colNum, yTop + 45);

                // Gravity block
                const gColor = f.nivel_gravedad === 'Alta' ? '#ef4444' : (f.nivel_gravedad === 'Media' ? '#f59e0b' : '#71717a');
                doc.rect(colGrav, yTop + 10, 15, rowHeight - 20).fill(gColor);

                // Category & Description
                doc.fillColor(primaryColor).font('Helvetica-Bold').text(f.categoria_falla, colDesc, yTop + 15, { width: 200 });
                doc.fillColor(textColor).font('Helvetica').fontSize(9);
                doc.text(f.descripcion ?? '', colDesc, yTop + 30, { width: 200, height: 60, ellipsis: true });

                // Image
                if (f.imagenes && f.imagenes.length > 0) {
                    try {
                        const imgUrl = f.imagenes[0].url_imagen;
                        const response = await fetch(imgUrl);
                        if (response.ok) {
                            const arrayBuffer = await response.arrayBuffer();
                            const buffer = Buffer.from(arrayBuffer);
                            doc.image(buffer, colImg, yTop + 10, { fit: [imgW, rowHeight - 20], align: 'center', valign: 'center' });
                        }
                    } catch (e) {
                        doc.fillColor('#ef4444').text('[Imagen no disponible]', colImg, yTop + 45);
                    }
                } else {
                    doc.fillColor('#a1a1aa').font('Helvetica-Oblique').text('Sin registro fotográfico', colImg, yTop + 45);
                }

                // Bottom border
                doc.moveTo(50, yTop + rowHeight).lineTo(545, yTop + rowHeight).strokeColor('#d4d4d8').stroke();
                doc.y = yTop + rowHeight;
            }
        }

        // --- 7. SUGERENCIAS Y CONCLUSIONES ---
        doc.addPage();
        addTocEntry('5. Sugerencias y Conclusiones');
        doc.fillColor(primaryColor).fontSize(20).font('Helvetica-Bold').text('5. Sugerencias y Conclusiones', 50, 60);
        doc.rect(50, 85, 495, 2).fill(accentColor);
        doc.y = 110;

        doc.fontSize(14).font('Helvetica-Bold').fillColor(primaryColor).text('Sugerencias al Propietario / Cliente');
        doc.moveDown(0.5);
        doc.fontSize(11).font('Helvetica').fillColor(textColor);
        if (informe.observaciones_cliente) {
            doc.text(informe.observaciones_cliente);
        } else {
            doc.text('No se registraron observaciones o sugerencias adicionales específicas para esta inspección.');
        }

        doc.moveDown(2);
        doc.fontSize(14).font('Helvetica-Bold').fillColor(primaryColor).text('Conclusión Oficial');
        doc.moveDown(0.5);
        doc.fontSize(11).font('Helvetica').fillColor(textColor);

        const veredicto = informe.veredicto_final;
        let conclusionText = `Tras concluir la revisión visual no invasiva del inmueble y analizar los hallazgos documentados, Inspect App emite el veredicto oficial de: "${veredicto}".\n\n`;

        if (veredicto.includes('Rechazado')) {
            conclusionText += 'Es mandatorio y urgente abordar las fallas reportadas, especialmente aquellas de gravedad Alta, ya que comprometen la funcionalidad, habitabilidad o seguridad del inmueble. Se sugiere la intervención de contratistas especializados.';
        } else if (veredicto.includes('condiciones') || veredicto.includes('menores')) {
            conclusionText += 'La propiedad presenta un estado aceptable, sin embargo, existen observaciones que deben ser subsanadas para alcanzar el estándar óptimo y evitar deterioros futuros a mediano plazo.';
        } else {
            conclusionText += 'La propiedad ha superado la inspección satisfactoriamente, cumpliendo con los estándares visuales de habitabilidad y funcionalidad evaluados en este proceso.';
        }
        doc.text(conclusionText, { align: 'justify' });

        // --- DRAW TOC (Back on Page 1) ---
        doc.switchToPage(tocPageIndex);
        doc.fillColor(primaryColor).fontSize(24).font('Helvetica-Bold').text('ÍNDICE', 50, 100, { align: 'center' });
        doc.rect(200, 135, 195, 2).fill(accentColor);
        doc.y = 160;
        doc.font('Helvetica').fontSize(14).fillColor(textColor);

        toc.forEach(entry => {
            doc.text(entry.title, 100, doc.y, { continued: true });
            doc.text(entry.page.toString(), { align: 'right' });
            doc.moveDown(1);
        });

        // --- ADD GLOBAL HEADERS AND FOOTERS ---
        const pages = doc.bufferedPageRange();
        // Skip page 0 (Portada)
        for (let i = 1; i < pages.count; i++) {
            doc.switchToPage(i);

            // Header Bar
            doc.rect(0, 0, doc.page.width, 15).fill(primaryColor);
            doc.rect(0, 15, doc.page.width, 3).fill(accentColor);

            // Footer Bar
            doc.rect(0, doc.page.height - 35, doc.page.width, 35).fill(primaryColor);
            doc.fillColor('#ffffff').fontSize(8).font('Helvetica-Bold');
            doc.text('INSPECT APP', 50, doc.page.height - 22);
            doc.font('Helvetica').text(`|   Folio: ${folio}`, 120, doc.page.height - 22);
            doc.text(`Página ${i} de ${pages.count - 1}`, 0, doc.page.height - 22, { align: 'right', width: doc.page.width - 50 });
        }

        doc.end();

    } catch (error) {
        console.error('[informe.controller] Error generating PDF:', error);
        if (error.message === 'INFORME_NO_ENCONTRADO') {
            return res.status(404).json({ error: 'No se encontró un informe para esta revisión' });
        }
        res.status(500).json({ error: 'Error al generar el PDF', detalle: error.message });
    }
};