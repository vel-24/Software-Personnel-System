import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
    // Create transporter
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    // Define email options
    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: options.email,
        subject: options.subject,
        html: options.html
    };

    // Send email
    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent to ${options.email}`);
        return { success: true };
    } catch (error) {
        console.error('❌ Email send failed:', error.message);
        return { success: false, error: error.message };
    }
};

export default sendEmail;