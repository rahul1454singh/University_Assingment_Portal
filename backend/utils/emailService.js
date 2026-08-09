const nodemailer = require("nodemailer");

// Create Transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

/**
 * Send Welcome Email for New User (Requirement 12)
 */
const sendWelcomeEmail = async (userName, email, temporaryPassword) => {
  const subject = "Welcome to University Assignment Portal";
  
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #1e293b;">
      <h2 style="color: #1e3c72; margin-top: 0; font-size: 22px;">Welcome to University Assignment Portal</h2>
      <p style="font-size: 15px; line-height: 1.5;">Hello <strong>${userName}</strong>,</p>
      <p style="font-size: 15px; line-height: 1.5;">Your university account has been created successfully.</p>
      
      <div style="background-color: #f8fafc; padding: 18px; border-radius: 10px; border-left: 4px solid #2563eb; margin: 20px 0;">
        <p style="margin: 4px 0; font-size: 14px;"><strong>Registered Email:</strong> ${email}</p>
        <p style="margin: 4px 0; font-size: 14px;"><strong>Temporary Password:</strong> ${temporaryPassword}</p>
      </div>

      <p style="font-size: 14px; color: #475569; line-height: 1.5;">Please change your password after logging in for security reasons.</p>
      
      <div style="text-align: center; margin: 28px 0;">
        <button style="background: linear-gradient(135deg, #1e3c72, #2a5298); color: #ffffff; padding: 12px 28px; border: none; border-radius: 8px; font-weight: 700; font-size: 15px; cursor: pointer;">
          Login
        </button>
      </div>

      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
      <p style="margin: 0; color: #64748b; font-size: 13px; line-height: 1.5;">Regards,<br><strong>University Assignment Portal</strong></p>
    </div>
  `;

  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"${process.env.FROM_NAME || "University Admin"}" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
      to: email,
      subject,
      html: htmlContent
    });
   } catch (err) {
    console.error(`[EMAIL ERROR] Failed to send welcome email to ${email}:`, err.message);
    throw err;
  }
};

/**
 * Send Admin User Update Notification Email (Requirement 11)
 */
const sendAdminUserUpdateEmail = async (userName, email, updatedFieldsList = [], isPasswordChanged = false) => {
  const subject = isPasswordChanged
    ? "Security Notice: Your Password Has Been Changed"
    : "Notification: Your University Account Has Been Updated";

  const fieldsHtml = updatedFieldsList.length > 0
    ? updatedFieldsList.map(f => `<li style="margin-bottom: 4px;">${f}</li>`).join("")
    : `<li style="margin-bottom: 4px;">Account profile details updated</li>`;

  const passwordNoticeBlock = isPasswordChanged
    ? `
      <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 14px; border-radius: 8px; margin: 16px 0;">
        <p style="margin: 0; font-size: 14px; color: #991b1b; line-height: 1.5;">
          <strong>Security Notice:</strong> Your university account password has been changed by an administrator.
        </p>
      </div>
    `
    : "";

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #1e293b;">
      <h2 style="color: #1e3c72; margin-top: 0; font-size: 20px;">University Assignment Portal</h2>
      <p style="font-size: 15px; line-height: 1.5;">Hello <strong>${userName}</strong>,</p>
      <p style="font-size: 15px; line-height: 1.5;">Your account information was updated by a University Administrator.</p>

      ${passwordNoticeBlock}
      
      <div style="background-color: #f8fafc; padding: 16px; border-radius: 10px; border-left: 4px solid #2563eb; margin: 20px 0;">
        <p style="margin: 0 0 8px 0; font-weight: bold; font-size: 14px;">Updated Information:</p>
        <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #334155;">
          ${fieldsHtml}
        </ul>
      </div>

      <p style="font-size: 13px; color: #64748b; line-height: 1.5;">
        If you did not request or expect this change, please contact the university administration immediately.
      </p>

      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
      <p style="margin: 0; color: #64748b; font-size: 13px; line-height: 1.5;">Regards,<br><strong>University Assignment Portal</strong></p>
    </div>
  `;

  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"${process.env.FROM_NAME || "University Admin"}" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
      to: email,
      subject,
      html: htmlContent
    });
  } catch (err) {
    console.error(`[EMAIL ERROR] Failed to send user update notification to ${email}:`, err.message);
  }
};

/**
 * Send Forgot Password OTP Email (Requirement 13)
 */
const sendOtpEmail = async (email, otp) => {
  const subject = "Your Password Reset OTP";
  
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; text-align: center; color: #1e293b;">
      <h2 style="color: #1e3c72; margin-top: 0;">Password Reset Request</h2>
      <p style="font-size: 14px; color: #475569;">Use the following 4-digit OTP code to reset your password. This code is valid for 15 minutes.</p>
      <div style="margin: 24px 0;">
        <span style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #2563eb; background: #eff6ff; padding: 12px 28px; border-radius: 10px; border: 2px dashed #93c5fd;">${otp}</span>
      </div>
      <p style="font-size: 12px; color: #94a3b8;">If you did not request a password reset, please ignore this email.</p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
      <p style="margin: 0; color: #64748b; font-size: 13px;">Regards,<br><strong>University Assignment Portal</strong></p>
    </div>
  `;

  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"${process.env.FROM_NAME || "University Admin"}" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
      to: email,
      subject,
      html: htmlContent
    });
    } catch (err) {
    console.error(`[EMAIL ERROR] Failed to send OTP email to ${email}:`, err.message);
    throw err;
  }
};

module.exports = {
  sendWelcomeEmail,
  sendAdminUserUpdateEmail,
  sendOtpEmail
};
