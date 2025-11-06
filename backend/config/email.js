const nodemailer = require('nodemailer');

// Create transporter for Mailtrap
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD
        }
    });
};

// Send email function
const sendEmail = async (options) => {
    const transporter = createTransporter();
    
    const mailOptions = {
        from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html,
        attachments: options.attachments || []
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        return {
            success: true,
            messageId: info.messageId,
            response: info.response
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
};

module.exports = { sendEmail, createTransporter };