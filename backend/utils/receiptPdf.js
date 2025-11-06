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

      const peso = (n) => `₱${Number(n || 0).toFixed(2)}`;
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

      // Summary box
      const summaryTop = y + 10;
      doc.rect(350, summaryTop, 195, 80).strokeColor('#e0e0e0').stroke();
      doc.fontSize(11).fillColor('#333');
      doc.text('Summary', 360, summaryTop + 8);
      doc.fontSize(10).fillColor('#555');
      doc.text(`Items Total:`, 360, summaryTop + 28, { width: 100 });
      doc.text(peso(order.itemsPrice), 445, summaryTop + 28, { width: 100, align: 'right' });
      doc.text(`Tax:`, 360, summaryTop + 44, { width: 100 });
      doc.text(peso(order.taxPrice), 445, summaryTop + 44, { width: 100, align: 'right' });
      doc.text(`Shipping:`, 360, summaryTop + 60, { width: 100 });
      doc.text(peso(order.shippingPrice), 445, summaryTop + 60, { width: 100, align: 'right' });

      doc.fontSize(11).fillColor('#333');
      doc.text(`Total:`, 360, summaryTop + 80, { width: 100 });
      doc.fontSize(12).fillColor('#000');
      doc.text(peso(order.totalPrice), 445, summaryTop + 80, { width: 100, align: 'right' });

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