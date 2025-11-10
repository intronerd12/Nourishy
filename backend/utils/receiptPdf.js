const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

// Create a professional-looking PDF receipt with Philippine peso formatting
// Returns a Promise that resolves to the absolute file path
module.exports = function generateReceiptPdf(order, user) {
  return new Promise((resolve, reject) => {
    try {
      const receiptsDir = path.resolve(__dirname, '..', 'temp', 'receipts');
      fs.mkdirSync(receiptsDir, { recursive: true });
      const filePath = path.join(receiptsDir, `${order._id}.pdf`);

      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Use 'Php' text instead of the peso symbol to ensure printers render correctly
      const peso = (n) => `Php ${Number(n || 0).toFixed(2)}`;
      const orderDate = new Date(order.paidAt || Date.now()).toLocaleString();

      // Brand header
      doc
        .fillColor('#333')
        .fontSize(22)
        .text('Nourishy', { align: 'left' });
      doc
        .fontSize(10)
        .fillColor('#666')
        .text('Order Confirmation Receipt', { align: 'left' })
        .moveDown(0.5);

      // Horizontal rule
      doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#e0e0e0').stroke();
      doc.moveDown();

      // Order meta
      doc
        .fontSize(12)
        .fillColor('#333')
        .text(`Order ID: ${order._id}`)
        .text(`Order Date: ${orderDate}`)
        .moveDown();

      // Bill to
      doc
        .fontSize(12)
        .fillColor('#333')
        .text('Billed To:', { continued: false })
        .moveDown(0.25);
      doc
        .fontSize(11)
        .fillColor('#555')
        .text(`${user?.name || 'Customer'}`)
        .text(`${user?.email || ''}`)
        .moveDown();

      // Shipping info
      doc
        .fontSize(12)
        .fillColor('#333')
        .text('Shipping To:', { continued: false })
        .moveDown(0.25);
      doc
        .fontSize(11)
        .fillColor('#555')
        .text(`${order.shippingInfo?.address || ''}`)
        .text(`${order.shippingInfo?.city || ''}`)
        .text(`${order.shippingInfo?.postalCode || ''}, ${order.shippingInfo?.country || ''}`)
        .text(`Phone: ${order.shippingInfo?.phoneNo || ''}`)
        .moveDown();

      // Items table header
      const tableTop = doc.y + 10;
      doc.fontSize(11).fillColor('#333');
      doc.text('Product', 50, tableTop);
      doc.text('Qty', 300, tableTop, { width: 50, align: 'center' });
      doc.text('Price', 360, tableTop, { width: 90, align: 'right' });
      doc.text('Subtotal', 460, tableTop, { width: 85, align: 'right' });
      doc.moveTo(50, tableTop + 15).lineTo(545, tableTop + 15).strokeColor('#e0e0e0').stroke();

      let y = tableTop + 25;
      (order.orderItems || []).forEach((item) => {
        doc.fillColor('#555').fontSize(10);
        doc.text(item.name || '', 50, y);
        doc.text(String(item.quantity || 0), 300, y, { width: 50, align: 'center' });
        doc.text(peso(item.price || 0), 360, y, { width: 90, align: 'right' });
        const subtotal = (item.price || 0) * (item.quantity || 0);
        doc.text(peso(subtotal), 460, y, { width: 85, align: 'right' });
        y += 18;
      });

      doc.moveDown();

      // Summary box (responsive width/height to fit all lines)
      const summaryTop = y + 10;
      const boxLeft = 350;
      const boxWidth = 220; // widened to prevent clipping
      const labelX = boxLeft + 10;
      const amountBlockWidth = 110;
      const amountX = boxLeft + boxWidth - 10 - amountBlockWidth;
      const headerHeight = 24;
      const lineHeight = 18;

      const rows = [
        { label: 'Items Total:', value: peso(order.itemsPrice) },
        { label: 'Tax:', value: peso(order.taxPrice) },
        { label: 'Shipping:', value: peso(order.shippingPrice) },
        { label: 'Total:', value: peso(order.totalPrice), isTotal: true },
      ];

      const boxHeight = headerHeight + rows.length * lineHeight + 18; // padding bottom
      doc.rect(boxLeft, summaryTop, boxWidth, boxHeight).strokeColor('#e0e0e0').stroke();

      doc.fontSize(11).fillColor('#333').text('Summary', labelX, summaryTop + 8);

      let rowY = summaryTop + headerHeight;
      rows.forEach((row) => {
        if (row.isTotal) {
          doc.fontSize(11).fillColor('#333').text(row.label, labelX, rowY);
          doc.fontSize(12).fillColor('#000').text(row.value, amountX, rowY, { width: amountBlockWidth, align: 'right' });
        } else {
          doc.fontSize(10).fillColor('#555').text(row.label, labelX, rowY);
          doc.fontSize(10).fillColor('#555').text(row.value, amountX, rowY, { width: amountBlockWidth, align: 'right' });
        }
        rowY += lineHeight;
      });

      // Footer
      doc.moveDown(2);
      doc.fontSize(10).fillColor('#666').text('This receipt confirms your successful purchase. Thank you for shopping with Nourishy.');
      doc.fontSize(9).fillColor('#999').text('If you have any questions, reply to this email.');

      doc.end();

      stream.on('finish', () => resolve(filePath));
      stream.on('error', (err) => reject(err));
    } catch (err) {
      reject(err);
    }
  });
};