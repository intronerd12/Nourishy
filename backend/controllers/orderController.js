const Order = require('../models/order');
const Product = require('../models/product');
const { sendEmail } = require('../config/email');
const generateReceiptPdf = require('../utils/receiptPdf');

// Create new order => /api/v1/order/new
exports.newOrder = async (req, res, next) => {
    try {
        const {
            orderItems: rawOrderItems,
            shippingInfo,
            taxPrice = 0,
            shippingPrice = 0,
            paymentInfo
        } = req.body;

        if (!Array.isArray(rawOrderItems) || rawOrderItems.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Order must include at least one item'
            });
        }

        // Validate and normalize items from cart against current product data
        const normalizedItems = [];
        let computedItemsPrice = 0;

        for (const item of rawOrderItems) {
            const { product: productId, quantity } = item || {};

            if (!productId || typeof quantity !== 'number' || quantity <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Each cart item must include valid product and quantity (>0)'
                });
            }

            const product = await Product.findById(productId);
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: `Product not found: ${productId}`
                });
            }

            if (product.stock < quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for product ${product.name}`
                });
            }

            const price = Number(product.price) || 0;
            const image = Array.isArray(product.images) && product.images.length > 0 ? product.images[0].url : '';

            normalizedItems.push({
                name: product.name,
                quantity,
                image,
                price,
                product: product._id
            });

            computedItemsPrice += price * quantity;
        }

        const itemsPrice = Number(computedItemsPrice.toFixed(2));
        const totalPrice = Number((itemsPrice + Number(taxPrice) + Number(shippingPrice)).toFixed(2));

        const order = await Order.create({
            orderItems: normalizedItems,
            shippingInfo,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
            paymentInfo,
            paidAt: Date.now(),
            user: req.user._id
        });

        // Build order confirmation email
        try {
            const formatCurrency = (n) => Number(n || 0).toFixed(2);
            const orderDate = new Date(order.paidAt).toLocaleString();
            const itemsRows = order.orderItems
                .map(item => `
                    <tr>
                        <td style="padding:8px;border-bottom:1px solid #eee;">${item.name}</td>
                        <td style="padding:8px;text-align:center;border-bottom:1px solid #eee;">${item.quantity}</td>
                        <td style="padding:8px;text-align:right;border-bottom:1px solid #eee;">₱${formatCurrency(item.price)}</td>
                        <td style="padding:8px;text-align:right;border-bottom:1px solid #eee;">₱${formatCurrency(item.price * item.quantity)}</td>
                    </tr>
                `)
                .join('');

            const html = `
                <div style="font-family:Arial,Helvetica,sans-serif;color:#333;">
                    <h2 style="margin-bottom:4px;">Nourishy - Order Confirmation</h2>
                    <p style="margin-top:0;color:#555;">Thank you for your purchase, ${req.user.name}!</p>
                    <div style="margin:16px 0;padding:12px;background:#f8f9fa;border:1px solid #e9ecef;border-radius:6px;">
                        <p style="margin:0 0 6px 0;">Order ID: <strong>${order._id}</strong></p>
                        <p style="margin:0;">Order Date: <strong>${orderDate}</strong></p>
                    </div>

                    <h3 style="margin:16px 0 8px;">Items</h3>
                    <table style="width:100%;border-collapse:collapse;border:1px solid #eee;">
                        <thead>
                            <tr style="background:#fafafa;">
                                <th style="text-align:left;padding:8px;border-bottom:1px solid #eee;">Product</th>
                                <th style="text-align:center;padding:8px;border-bottom:1px solid #eee;">Qty</th>
                                <th style="text-align:right;padding:8px;border-bottom:1px solid #eee;">Price</th>
                                <th style="text-align:right;padding:8px;border-bottom:1px solid #eee;">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsRows}
                        </tbody>
                    </table>

                    <div style="margin-top:16px;display:flex;justify-content:flex-end;">
                        <table style="min-width:280px;border-collapse:collapse;">
                            <tr>
                                <td style="padding:6px;color:#555;">Items Total</td>
                                <td style="padding:6px;text-align:right;">₱${formatCurrency(order.itemsPrice)}</td>
                            </tr>
                            <tr>
                                <td style="padding:6px;color:#555;">Tax</td>
                                <td style="padding:6px;text-align:right;">₱${formatCurrency(order.taxPrice)}</td>
                            </tr>
                            <tr>
                                <td style="padding:6px;color:#555;">Shipping</td>
                                <td style="padding:6px;text-align:right;">₱${formatCurrency(order.shippingPrice)}</td>
                            </tr>
                            <tr>
                                <td style="padding:6px;border-top:1px solid #ddd;"><strong>Total</strong></td>
                                <td style="padding:6px;text-align:right;border-top:1px solid #ddd;"><strong>₱${formatCurrency(order.totalPrice)}</strong></td>
                            </tr>
                        </table>
                    </div>

                    <h3 style="margin:16px 0 8px;">Shipping Information</h3>
                    <div style="padding:12px;border:1px solid #e9ecef;border-radius:6px;background:#fdfdfd;">
                        <p style="margin:0;">${order.shippingInfo.address}, ${order.shippingInfo.city}</p>
                        <p style="margin:0;">${order.shippingInfo.postalCode}, ${order.shippingInfo.country}</p>
                        <p style="margin:0;">Phone: ${order.shippingInfo.phoneNo}</p>
                    </div>

                    <p style="margin-top:16px;color:#555;">This email confirms your successful purchase. If you have any questions, just reply to this email.</p>
                    <p style="margin-top:8px;color:#555;">— The Nourishy Team</p>
                </div>
            `;

            // Generate PDF receipt and attach to email
            let attachments = [];
            let pdfPathToCleanup = null;
            try {
                const pdfPath = await generateReceiptPdf(order, req.user);
                pdfPathToCleanup = pdfPath;
                attachments.push({
                    filename: `Nourishy-Receipt-${order._id}.pdf`,
                    path: pdfPath,
                    contentType: 'application/pdf'
                });
            } catch (pdfErr) {
                console.error('Failed to generate PDF receipt:', pdfErr);
            }

            await sendEmail({
                email: req.user.email,
                subject: `Nourishy - Order Confirmation #${order._id}`,
                html,
                attachments
            });

            // Attempt to remove temp PDF after sending
            if (pdfPathToCleanup) {
                try {
                    const fs = require('fs');
                    fs.unlink(pdfPathToCleanup, () => {});
                } catch (cleanupErr) {
                    console.warn('Could not delete temp receipt PDF:', cleanupErr);
                }
            }
        } catch (emailError) {
            // Do not block order success if email fails; log for diagnostics
            console.error('Failed to send order confirmation email:', emailError);
        }

        res.status(200).json({
            success: true,
            order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get single order => /api/v1/order/:id
exports.getSingleOrder = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'No Order found with this ID'
            });
        }

        // Ensure only the owner or an admin can access this order
        if (
            order.user &&
            order.user._id &&
            order.user._id.toString() !== req.user._id.toString() &&
            req.user.role !== 'admin'
        ) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this order'
            });
        }

        res.status(200).json({
            success: true,
            order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get logged in user orders => /api/v1/orders/me
exports.myOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({ user: req.user.id });

        res.status(200).json({
            success: true,
            orders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get all orders - Admin => /api/v1/admin/orders/
exports.allOrders = async (req, res, next) => {
    try {
        // Populate user name and email so admins can identify who placed each order
        const orders = await Order.find().populate('user', 'name email');

        const totalAmount = orders.reduce((sum, o) => sum + (Number(o.totalPrice) || 0), 0);

        res.status(200).json({
            success: true,
            totalAmount,
            orders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update / Process order - Admin => /api/v1/admin/order/:id
exports.updateOrder = async (req, res, next) => {
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.id).populate('user', 'name email');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'No Order found with this ID'
            });
        }

        if (order.orderStatus === 'Delivered') {
            return res.status(400).json({
                success: false,
                message: 'You have already delivered this order'
            });
        }

        // Only deduct stock once when moving to Confirmed for the first time
        const prevStatus = order.orderStatus;
        const nextStatus = String(status || '').trim();

        if (nextStatus === 'Confirmed' && prevStatus !== 'Confirmed' && prevStatus !== 'Delivered') {
            for (const item of order.orderItems) {
                await updateStock(item.product, item.quantity);
            }
        }

        order.orderStatus = nextStatus || order.orderStatus;

        // Set deliveredAt only when marking as Delivered
        if (nextStatus === 'Delivered') {
            order.deliveredAt = Date.now();
        }

        await order.save();

        // Send status update email to the customer
        try {
            const formatCurrency = (n) => Number(n || 0).toFixed(2);
            const statusBadgeColor = {
                Pending: '#f0ad4e',
                Confirmed: '#5cb85c',
                Cancelled: '#d9534f',
                Delivered: '#0275d8'
            }[order.orderStatus] || '#777';

            const itemsRows = (order.orderItems || [])
                .map(item => `
                    <tr>
                        <td style="padding:8px;border-bottom:1px solid #eee;">${item.name}</td>
                        <td style="padding:8px;text-align:center;border-bottom:1px solid #eee;">${item.quantity}</td>
                        <td style="padding:8px;text-align:right;border-bottom:1px solid #eee;">₱${formatCurrency(item.price)}</td>
                        <td style="padding:8px;text-align:right;border-bottom:1px solid #eee;">₱${formatCurrency(item.price * item.quantity)}</td>
                    </tr>
                `)
                .join('');

            const html = `
                <div style="font-family:Arial,Helvetica,sans-serif;color:#333;">
                    <h2 style="margin-bottom:4px;">Nourishy - Order Status Update</h2>
                    <p style="margin-top:0;color:#555;">Hello ${order.user?.name || 'Customer'}, your order status was updated.</p>
                    <div style="margin:16px 0;padding:12px;background:#f8f9fa;border:1px solid #e9ecef;border-radius:6px;">
                        <p style="margin:0 0 6px 0;">Order ID: <strong>${order._id}</strong></p>
                        <p style="margin:0;">Current Status: <span style="display:inline-block;padding:4px 8px;border-radius:12px;color:#fff;background:${statusBadgeColor};">${order.orderStatus}</span></p>
                    </div>

                    <h3 style="margin:16px 0 8px;">Items</h3>
                    <table style="width:100%;border-collapse:collapse;border:1px solid #eee;">
                        <thead>
                            <tr style="background:#fafafa;">
                                <th style="text-align:left;padding:8px;border-bottom:1px solid #eee;">Product</th>
                                <th style="text-align:center;padding:8px;border-bottom:1px solid #eee;">Qty</th>
                                <th style="text-align:right;padding:8px;border-bottom:1px solid #eee;">Price</th>
                                <th style="text-align:right;padding:8px;border-bottom:1px solid #eee;">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsRows}
                        </tbody>
                    </table>

                    <div style="margin-top:16px;display:flex;justify-content:flex-end;">
                        <table style="min-width:280px;border-collapse:collapse;">
                            <tr>
                                <td style="padding:6px;color:#555;">Items Total</td>
                                <td style="padding:6px;text-align:right;">₱${formatCurrency(order.itemsPrice)}</td>
                            </tr>
                            <tr>
                                <td style="padding:6px;color:#555;">Tax</td>
                                <td style="padding:6px;text-align:right;">₱${formatCurrency(order.taxPrice)}</td>
                            </tr>
                            <tr>
                                <td style="padding:6px;color:#555;">Shipping</td>
                                <td style="padding:6px;text-align:right;">₱${formatCurrency(order.shippingPrice)}</td>
                            </tr>
                            <tr>
                                <td style="padding:6px;border-top:1px solid #ddd;"><strong>Total</strong></td>
                                <td style="padding:6px;text-align:right;border-top:1px solid #ddd;"><strong>₱${formatCurrency(order.totalPrice)}</strong></td>
                            </tr>
                        </table>
                    </div>

                    <p style="margin-top:16px;color:#555;">If you have any questions, reply to this email.</p>
                    <p style="margin-top:8px;color:#555;">— The Nourishy Team</p>
                </div>
            `;

            // Generate and attach updated PDF receipt
            let attachments = [];
            let pdfPathToCleanup = null;
            try {
                const pdfPath = await generateReceiptPdf(order, order.user);
                pdfPathToCleanup = pdfPath;
                attachments.push({
                    filename: `Nourishy-Receipt-${order._id}.pdf`,
                    path: pdfPath,
                    contentType: 'application/pdf'
                });
            } catch (pdfErr) {
                console.error('Failed to generate PDF receipt for status update:', pdfErr);
            }

            await sendEmail({
                email: order.user?.email,
                subject: `Nourishy - Order ${order.orderStatus}`,
                html,
                attachments
            });

            // Attempt to remove temp PDF after sending
            if (pdfPathToCleanup) {
                try {
                    const fs = require('fs');
                    fs.unlink(pdfPathToCleanup, () => {});
                } catch (cleanupErr) {
                    console.warn('Could not delete temp receipt PDF:', cleanupErr);
                }
            }
        } catch (emailErr) {
            console.error('Failed to send order status email:', emailErr);
        }

        res.status(200).json({
            success: true,
            order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

async function updateStock(id, quantity) {
    const product = await Product.findById(id);
    product.stock = product.stock - quantity;
    await product.save({ validateBeforeSave: false });
}

// Delete order => /api/v1/admin/order/:id
exports.deleteOrder = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'No Order found with this ID'
            });
        }

        await order.remove();

        res.status(200).json({
            success: true
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};