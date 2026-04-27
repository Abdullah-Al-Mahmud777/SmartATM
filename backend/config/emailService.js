const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS  // Gmail App Password
    }
  });
};

// Send OTP Email
exports.sendOtpEmail = async (toEmail, otp, userName) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"SmartATM Security" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: '🔐 SmartATM - PIN Reset OTP',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 20px; }
            .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #1e40af, #3b82f6); padding: 30px; text-align: center; }
            .header h1 { color: white; margin: 0; font-size: 24px; }
            .header p { color: #bfdbfe; margin: 8px 0 0; }
            .body { padding: 30px; }
            .otp-box { background: #eff6ff; border: 2px dashed #3b82f6; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0; }
            .otp { font-size: 42px; font-weight: bold; color: #1e40af; letter-spacing: 12px; }
            .otp-label { color: #6b7280; font-size: 13px; margin-top: 8px; }
            .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 6px; margin: 20px 0; }
            .warning p { margin: 0; color: #92400e; font-size: 13px; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb; }
            .footer p { color: #9ca3af; font-size: 12px; margin: 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏧 SmartATM</h1>
              <p>PIN Reset Request</p>
            </div>
            <div class="body">
              <p style="color:#374151; font-size:16px;">Hello <strong>${userName}</strong>,</p>
              <p style="color:#6b7280;">We received a request to reset your ATM PIN. Use the OTP below:</p>
              
              <div class="otp-box">
                <div class="otp">${otp}</div>
                <div class="otp-label">One-Time Password (OTP)</div>
              </div>

              <div class="warning">
                <p>⏰ This OTP is valid for <strong>10 minutes</strong> only.</p>
              </div>

              <p style="color:#6b7280; font-size:14px;">If you did not request this, please ignore this email. Your PIN will remain unchanged.</p>
              <p style="color:#6b7280; font-size:14px;">Never share this OTP with anyone.</p>
            </div>
            <div class="footer">
              <p>© 2024 SmartATM. This is an automated email, please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent to ${toEmail}`);
    return true;

  } catch (error) {
    console.error('❌ Email send error:', error.message);
    return false;
  }
};
