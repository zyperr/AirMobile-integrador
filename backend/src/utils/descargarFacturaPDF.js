import PDFDocument from 'pdfkit';
import ModelDetalleFactura from '../models/modelDetalleFactura.js';

export const descargarFacturaPDF = async (req, res) => {
    try {
        const idFactura = req.params.id;
        const detalles = await ModelDetalleFactura.getDetallesFacturaByFacturaId(idFactura);

        if (!detalles || detalles.length === 0) {
            return res.status(404).json({ exito: false, message: "Factura no encontrada" });
        }

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename=factura-${idFactura}.pdf`);

        // Creamos el documento con márgenes definidos y tamaño estándar A4
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        doc.pipe(res);

        // ==========================================
        // 1. ENCABEZADO Y BRANDING
        // ==========================================
        // Nombre de la marca con un tono pastel elegante
        doc.fillColor('#0d6efd')
           .fontSize(28)
           .font('Helvetica-Bold')
           .text("AirMobile", 50, 50);
           
        doc.fillColor('#888888')
           .fontSize(10)
           .font('Helvetica')
           .text('Tu e-commerce de confianza', 50, 80);

        // ==========================================
        // 2. DETALLES DE LA FACTURA (Alineados a la derecha)
        // ==========================================
        doc.fillColor('#333333')
           .fontSize(14)
           .font('Helvetica-Bold')
           .text('FACTURA', 400, 50, { align: 'right' });
           
        doc.font('Helvetica')
           .fontSize(10)
           .text(`N° de documento: INV-${idFactura}`, { align: 'right' });

        // Formateamos la fecha si existe
        if (detalles[0].fecha) {
            const fechaCruda = new Date(detalles[0].fecha + 'Z');
            const fechaFormateada = fechaCruda.toLocaleDateString('es-CO', { 
                year: 'numeric', month: 'long', day: 'numeric' 
            });
            doc.text(`Fecha de emisión: ${fechaFormateada}`, { align: 'right' });
        }

        doc.moveDown(4);

        // ==========================================
        // 3. TABLA DE PRODUCTOS (Líneas y Cabeceras)
        // ==========================================
        const topTabla = doc.y;
        
        // Línea superior decorativa (Tono pastel)
        doc.moveTo(50, topTabla)
           .lineTo(545, topTabla)
           .lineWidth(1.5)
           .strokeColor('#fadadd')
           .stroke();

        doc.moveDown(1);
        const cabeceraY = doc.y;

        // Textos de la cabecera
        doc.font('Helvetica-Bold').fillColor('#333333').fontSize(10);
        doc.text('CANT.', 50, cabeceraY);
        doc.text('DESCRIPCIÓN', 100, cabeceraY);
        doc.text('P. UNITARIO', 350, cabeceraY, { width: 90, align: 'right' });
        doc.text('SUBTOTAL', 450, cabeceraY, { width: 95, align: 'right' });

        // Línea separadora de la cabecera
        doc.moveTo(50, cabeceraY + 15)
           .lineTo(545, cabeceraY + 15)
           .lineWidth(0.5)
           .strokeColor('#dddddd')
           .stroke();

        // ==========================================
        // 4. FILAS DINÁMICAS Y MATEMÁTICAS
        // ==========================================
        let posY = cabeceraY + 25;
        let totalFactura = 0;

        doc.font('Helvetica').fillColor('#555555');

        detalles.forEach(item => {
            // Calculamos el subtotal de esta fila
            const subtotalItem = item.cantidad * item.precio_unitario;
            totalFactura += subtotalItem;

            // Dibujamos los datos en sus columnas exactas
            doc.text(item.cantidad.toString(), 50, posY);
            
            // Limitamos el ancho del nombre por si es muy largo
            doc.text(item.nombre_producto, 100, posY, { width: 240 }); 
            
            doc.text(`$${parseFloat(item.precio_unitario).toFixed(2)}`, 350, posY, { width: 90, align: 'right' });
            doc.text(`$${subtotalItem.toFixed(2)}`, 450, posY, { width: 95, align: 'right' });

            // Bajamos 20 pixeles para la siguiente fila
            posY += 20; 
        });

        // ==========================================
        // 5. SECCIÓN DE TOTALES
        // ==========================================
        // Línea fuerte antes del total
        doc.moveTo(350, posY + 10)
           .lineTo(545, posY + 10)
           .lineWidth(1)
           .strokeColor('#333333')
           .stroke();

        posY += 25;
        doc.font('Helvetica-Bold').fillColor('#333333').fontSize(12);
        doc.text('TOTAL:', 350, posY, { width: 90, align: 'right' });
        
        // Destacamos el precio final
        doc.fillColor('#0d6efd').fontSize(14)
           .text(`$${totalFactura.toFixed(2)}`, 450, posY - 2, { width: 95, align: 'right' });

        // ==========================================
        // 6. PIE DE PÁGINA
        // ==========================================
        doc.font('Helvetica-Oblique')
           .fillColor('#aaaaaa')
           .fontSize(10)
           .text('¡Gracias por tu compra! Esperamos verte pronto.', 50, 750, { align: 'center', lineBreak: false });

        // Cerramos el documento
        doc.end();

    } catch (error) {
        console.error("Error al generar PDF:", error);
        res.status(500).json({ exito: false, message: "Error al generar PDF" });
    }
}