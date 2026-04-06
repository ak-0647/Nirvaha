import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: '74.125.130.108', // Direct IP for smtp.gmail.com to bypass DNS blocks
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD
  },
  tls: {
    rejectUnauthorized: false,
    servername: 'smtp.gmail.com'
  },
  family: 4
});

// ═══ NIRVAHA Email Template Wrapper ═══
const wrapInTemplate = (bodyContent) => `
  <div style="font-family: 'Georgia', serif; max-width: 500px; margin: 0 auto; background: #0a0a0a; border-radius: 16px; overflow: hidden; border: 1px solid rgba(201,169,110,0.2);">
    <div style="background: linear-gradient(135deg, #1a1a1a, #0a0a0a); padding: 2.5rem; text-align: center; border-bottom: 1px solid rgba(201,169,110,0.15);">
      <h1 style="color: #c9a96e; font-size: 1.8rem; font-weight: 600; letter-spacing: 0.15em; margin: 0;">NIRVAHA</h1>
    </div>
    <div style="padding: 2.5rem; text-align: center;">
      ${bodyContent}
    </div>
    <div style="border-top: 1px solid rgba(201,169,110,0.1); padding: 1.5rem; text-align: center;">
      <p style="color: #5a5650; font-size: 0.7rem; margin: 0;">© 2024 NIRVAHA. All rights reserved.</p>
    </div>
  </div>
`;

// Generate a 6-digit OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP via email
export const sendOTPEmail = async (email, otp, firstName) => {
  const mailOptions = {
    from: `"NIRVAHA 👑" <${process.env.SMTP_EMAIL}>`,
    to: email,
    subject: '✨ Your NIRVAHA Verification Code',
    html: wrapInTemplate(`
      <p style="color: #c4b99a; font-size: 1rem; margin-bottom: 0.5rem;">Hello <strong style="color: #f5f0e8;">${firstName}</strong>,</p>
      <p style="color: #8a8478; font-size: 0.9rem; line-height: 1.7; margin-bottom: 2rem;">
        Welcome to Nirvaha! Please use the verification code below to complete your registration.
      </p>
      <div style="background: linear-gradient(135deg, rgba(201,169,110,0.12), rgba(201,169,110,0.04)); border: 2px solid rgba(201,169,110,0.3); border-radius: 12px; padding: 1.5rem; margin: 0 auto 2rem; display: inline-block;">
        <p style="color: #c9a96e; font-size: 0.7rem; letter-spacing: 0.2em; text-transform: uppercase; margin: 0 0 0.5rem;">Your Verification Code</p>
        <p style="color: #f5f0e8; font-size: 2.5rem; font-weight: 700; letter-spacing: 0.4em; margin: 0; font-family: monospace;">${otp}</p>
      </div>
    `)
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 OTP Email sent to ${email}`);
  } catch (error) {
    console.error('❌ SMTP Error:', error.message);
    console.log('-----------------------------------------');
    console.log(`🔑 DEV FALLBACK | OTP for ${email}: ${otp}`);
    console.log('-----------------------------------------');
  }
};

// Send Welcome email after verification
export const sendWelcomeEmail = async (email, firstName) => {
  const mailOptions = {
    from: `"NIRVAHA 👑" <${process.env.SMTP_EMAIL}>`,
    to: email,
    subject: '💙 Welcome to NIRVAHA, ' + firstName + '!',
    html: wrapInTemplate(`
      <h2 style="color: #f5f0e8; font-size: 1.5rem; margin-bottom: 1rem;">Welcome, ${firstName}! ✨</h2>
      <p style="color: #8a8478; font-size: 0.9rem; line-height: 1.8;">
        Your account has been verified successfully! You're now a part of the NIRVAHA family.<br><br>
        We design minimal, aesthetic kurtis crafted with care in premium cotton & rayon. Stay tuned for our launch! 💗
      </p>
    `)
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 Welcome Email sent to ${email}`);
  } catch (error) {
    console.error('❌ SMTP Error: Failed to send welcome email.');
  }
};

// Send Forgot Password OTP
export const sendForgotPasswordEmail = async (email, otp, firstName) => {
  const mailOptions = {
    from: `"NIRVAHA 👑" <${process.env.SMTP_EMAIL}>`,
    to: email,
    subject: '✨ Your NIRVAHA Password Reset Code',
    html: wrapInTemplate(`
      <h2 style="color: #f5f0e8; font-size: 1.3rem; margin-bottom: 1rem;">Reset Your Password</h2>
      <p style="color: #c4b99a; font-size: 1rem; margin-bottom: 0.5rem;">Hello <strong style="color: #f5f0e8;">${firstName}</strong>,</p>
      <p style="color: #8a8478; font-size: 0.9rem; line-height: 1.7; margin-bottom: 2rem;">
        We received a request to reset your password. Use the verification code below to proceed.
      </p>
      <div style="background: linear-gradient(135deg, rgba(231,76,90,0.12), rgba(231,76,90,0.04)); border: 2px solid rgba(231,76,90,0.3); border-radius: 12px; padding: 1.5rem; margin: 0 auto 2rem; display: inline-block;">
        <p style="color: #e74c5a; font-size: 0.7rem; letter-spacing: 0.2em; text-transform: uppercase; margin: 0 0 0.5rem;">Reset Code</p>
        <p style="color: #f5f0e8; font-size: 2.5rem; font-weight: 700; letter-spacing: 0.4em; margin: 0; font-family: monospace;">${otp}</p>
      </div>
    `)
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 Forgot Password Email sent to ${email}`);
  } catch (error) {
    console.error('❌ SMTP Error: Failed to send forgot password email.');
    console.log('-----------------------------------------');
    console.log(`🔑 DEV FALLBACK | Reset Code for ${email}: ${otp}`);
    console.log('-----------------------------------------');
  }
};

// ═══════════════════════════════════════════════
// ORDER NOTIFICATION EMAILS
// ═══════════════════════════════════════════════

// Send email to ADMIN when a user places an order
export const sendOrderPlacedEmailToAdmin = async (orderDetails, userInfo) => {
  const itemsHtml = orderDetails.items.map(item => `
    <tr>
      <td style="padding: 0.6rem; border-bottom: 1px solid rgba(201,169,110,0.1); color: #f5f0e8; font-size: 0.85rem;">${item.name}</td>
      <td style="padding: 0.6rem; border-bottom: 1px solid rgba(201,169,110,0.1); color: #8a8478; font-size: 0.85rem; text-align: center;">${item.size}</td>
      <td style="padding: 0.6rem; border-bottom: 1px solid rgba(201,169,110,0.1); color: #c9a96e; font-size: 0.85rem; text-align: right;">${item.price}</td>
    </tr>
  `).join('');

  const mailOptions = {
    from: `"NIRVAHA Orders 📦" <${process.env.SMTP_EMAIL}>`,
    to: process.env.SMTP_EMAIL, // Admin email
    subject: `🛒 New Order: ${orderDetails.orderId} — ${userInfo.firstName} ${userInfo.lastName}`,
    html: wrapInTemplate(`
      <h2 style="color: #f5f0e8; font-size: 1.3rem; margin-bottom: 0.5rem;">📦 New Order Received!</h2>
      <p style="color: #8a8478; font-size: 0.9rem; line-height: 1.7; margin-bottom: 1.5rem;">
        A new order has been placed on NIRVAHA.
      </p>
      
      <div style="background: rgba(201,169,110,0.08); border: 1px solid rgba(201,169,110,0.2); border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem; text-align: left;">
        <p style="color: #c9a96e; font-size: 0.7rem; letter-spacing: 0.15em; text-transform: uppercase; margin: 0 0 0.5rem;">Order ID</p>
        <p style="color: #f5f0e8; font-size: 1.3rem; font-weight: 700; font-family: monospace; margin: 0 0 1rem;">${orderDetails.orderId}</p>
        
        <p style="color: #c9a96e; font-size: 0.7rem; letter-spacing: 0.15em; text-transform: uppercase; margin: 0 0 0.5rem;">Customer</p>
        <p style="color: #f5f0e8; font-size: 0.95rem; margin: 0;">${userInfo.firstName} ${userInfo.lastName}</p>
        <p style="color: #8a8478; font-size: 0.8rem; margin: 0.2rem 0 1rem;">${userInfo.email}</p>
        
        <p style="color: #c9a96e; font-size: 0.7rem; letter-spacing: 0.15em; text-transform: uppercase; margin: 0 0 0.5rem;">Total</p>
        <p style="color: #f5f0e8; font-size: 1.5rem; font-weight: 700; margin: 0;">${orderDetails.total}</p>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 1rem;">
        <thead>
          <tr style="border-bottom: 2px solid rgba(201,169,110,0.2);">
            <th style="padding: 0.6rem; text-align: left; color: #c9a96e; font-size: 0.7rem; letter-spacing: 0.1em; text-transform: uppercase;">Item</th>
            <th style="padding: 0.6rem; text-align: center; color: #c9a96e; font-size: 0.7rem; letter-spacing: 0.1em; text-transform: uppercase;">Size</th>
            <th style="padding: 0.6rem; text-align: right; color: #c9a96e; font-size: 0.7rem; letter-spacing: 0.1em; text-transform: uppercase;">Price</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
      </table>
    `)
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 Order notification sent to admin for ${orderDetails.orderId}`);
  } catch (error) {
    console.error('❌ SMTP Error: Failed to send order notification to admin.');
    console.log('-----------------------------------------');
    console.log(`📦 ORDER FALLBACK | ${orderDetails.orderId} from ${userInfo.email} | Total: ${orderDetails.total}`);
    console.log('-----------------------------------------');
  }
};

// Send email to USER when admin updates their order status
export const sendOrderUpdateEmailToUser = async (userEmail, firstName, orderId, newStatus) => {
  const statusEmoji = {
    'Processing': '⏳',
    'In Transit': '🚚',
    'Delivered': '✅',
    'Cancelled': '❌'
  };

  const statusColor = {
    'Processing': '#c9a96e',
    'In Transit': '#60a5fa',
    'Delivered': '#4ecb8d',
    'Cancelled': '#e74c5a'
  };

  const emoji = statusEmoji[newStatus] || '📦';
  const color = statusColor[newStatus] || '#c9a96e';

  const mailOptions = {
    from: `"NIRVAHA 👑" <${process.env.SMTP_EMAIL}>`,
    to: userEmail,
    subject: `${emoji} Order ${orderId} — ${newStatus}`,
    html: wrapInTemplate(`
      <h2 style="color: #f5f0e8; font-size: 1.3rem; margin-bottom: 0.5rem;">Order Status Updated</h2>
      <p style="color: #c4b99a; font-size: 1rem; margin-bottom: 0.5rem;">Hello <strong style="color: #f5f0e8;">${firstName}</strong>,</p>
      <p style="color: #8a8478; font-size: 0.9rem; line-height: 1.7; margin-bottom: 2rem;">
        Your order status has been updated. Here are the details:
      </p>
      
      <div style="background: linear-gradient(135deg, ${color}18, ${color}08); border: 2px solid ${color}40; border-radius: 12px; padding: 1.5rem; margin: 0 auto 1.5rem; display: inline-block; min-width: 250px;">
        <p style="color: #8a8478; font-size: 0.7rem; letter-spacing: 0.15em; text-transform: uppercase; margin: 0 0 0.5rem;">Order ID</p>
        <p style="color: #f5f0e8; font-size: 1.2rem; font-weight: 700; font-family: monospace; letter-spacing: 0.1em; margin: 0 0 1.2rem;">${orderId}</p>
        
        <p style="color: #8a8478; font-size: 0.7rem; letter-spacing: 0.15em; text-transform: uppercase; margin: 0 0 0.5rem;">New Status</p>
        <p style="color: ${color}; font-size: 1.5rem; font-weight: 700; margin: 0;">${emoji} ${newStatus}</p>
      </div>
      
      <p style="color: #5a5650; font-size: 0.8rem; line-height: 1.6; margin-top: 1rem;">
        If you have any questions about your order, feel free to reply to this email.
      </p>
    `)
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 Order update email sent to ${userEmail} for ${orderId}`);
  } catch (error) {
    console.error('❌ SMTP Error: Failed to send order update email to user.');
    console.log('-----------------------------------------');
    console.log(`📦 UPDATE FALLBACK | ${orderId} → ${newStatus} for ${userEmail}`);
    console.log('-----------------------------------------');
  }
};

// Send email to ADMIN when a user submits a custom order
export const sendCustomOrderReceivedEmail = async (adminEmail, userInfo, customOrderDetails, imageUrl, orderId) => {
  const mailOptions = {
    from: `"NIRVAHA 👑" <${process.env.SMTP_EMAIL}>`,
    to: adminEmail,
    subject: `✨ New Custom Order Request from ${userInfo.firstName}`,
    html: wrapInTemplate(`
      <h2 style="color: #f5f0e8; font-size: 1.3rem; margin-bottom: 0.5rem;">New Custom Request Received</h2>
      <p style="color: #c4b99a; font-size: 0.95rem; line-height: 1.7; margin-bottom: 2rem;">
        A new bespoke order request has been submitted. Please review and Accept/Reject the order.
      </p>

      <div style="background: rgba(26,22,19,0.5); border: 1px solid rgba(201,169,110,0.18); border-radius: 12px; padding: 1.5rem; margin-bottom: 2rem;">
        
        <p style="color: #c9a96e; font-size: 0.7rem; letter-spacing: 0.15em; text-transform: uppercase; margin: 0 0 0.5rem;">Order ID</p>
        <p style="color: #f5f0e8; font-size: 1.2rem; font-weight: 700; font-family: monospace; letter-spacing: 0.1em; margin: 0 0 1rem;">${orderId}</p>

        <p style="color: #c9a96e; font-size: 0.7rem; letter-spacing: 0.15em; text-transform: uppercase; margin: 0 0 0.5rem;">Customer</p>
        <p style="color: #f5f0e8; font-size: 0.95rem; margin: 0;">${userInfo.firstName} ${userInfo.lastName}</p>
        <p style="color: #8a8478; font-size: 0.8rem; margin: 0.2rem 0 1rem;">${userInfo.email}</p>
        
        <p style="color: #c9a96e; font-size: 0.7rem; letter-spacing: 0.15em; text-transform: uppercase; margin: 0 0 0.5rem;">Expected Price Range</p>
        <p style="color: #f5f0e8; font-size: 1.1rem; font-weight: 700; margin: 0 0 1rem;">${customOrderDetails.priceRange}</p>

        <p style="color: #c9a96e; font-size: 0.7rem; letter-spacing: 0.15em; text-transform: uppercase; margin: 0 0 0.5rem;">Requirements</p>
        <p style="color: #8a8478; font-size: 0.85rem; line-height: 1.6; margin: 0 0 1rem; white-space: pre-wrap;">${customOrderDetails.requirements}</p>

        ${imageUrl ? `
          <p style="color: #c9a96e; font-size: 0.7rem; letter-spacing: 0.15em; text-transform: uppercase; margin: 0 0 0.5rem;">Reference Image</p>
          <img src="${imageUrl}" alt="Reference" style="max-width: 100%; border-radius: 8px; border: 1px solid rgba(201,169,110,0.2);" />
        ` : ''}
      </div>
    `)
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 Custom Order notification sent to admin`);
  } catch (error) {
    console.error('❌ SMTP Error: Failed to send custom order notification to admin.', error);
  }
};

// Send email to USER when admin accepts, rejects, or updates custom order
export const sendCustomOrderStatusEmail = async (userEmail, firstName, status, adminNotes, orderId) => {
  const statusEmoji = {
    'Pending Assessment': '⏳',
    'Accepted': '✨',
    'Rejected': '❌',
    'In Production': '🪡',
    'Shipped': '🚚',
    'Completed': '✅',
    'Cancelled': '🚫'
  };

  const statusColor = {
    'Pending Assessment': '#c9a96e',
    'Accepted': '#4ecb8d',
    'Rejected': '#e74c5a',
    'In Production': '#c9a96e',
    'Shipped': '#60a5fa',
    'Completed': '#4ecb8d',
    'Cancelled': '#e74c5a'
  };

  const emoji = statusEmoji[status] || '📦';
  const color = statusColor[status] || '#c9a96e';

  const mailOptions = {
    from: `"NIRVAHA 👑" <${process.env.SMTP_EMAIL}>`,
    to: userEmail,
    subject: `${emoji} Custom Order ${orderId} — ${status}`,
    html: wrapInTemplate(`
      <h2 style="color: #f5f0e8; font-size: 1.3rem; margin-bottom: 0.5rem;">Custom Order Update</h2>
      <p style="color: #c4b99a; font-size: 1rem; margin-bottom: 0.5rem;">Hello <strong style="color: #f5f0e8;">${firstName}</strong>,</p>
      <p style="color: #8a8478; font-size: 0.9rem; line-height: 1.7; margin-bottom: 2rem;">
        There has been an update regarding your bespoke custom order request.
      </p>
      
      <div style="background: linear-gradient(135deg, ${color}18, ${color}08); border: 2px solid ${color}40; border-radius: 12px; padding: 1.5rem; margin: 0 auto 1.5rem; display: inline-block; min-width: 250px;">
        <p style="color: #8a8478; font-size: 0.7rem; letter-spacing: 0.15em; text-transform: uppercase; margin: 0 0 0.5rem;">Order ID</p>
        <p style="color: #f5f0e8; font-size: 1.2rem; font-weight: 700; font-family: monospace; letter-spacing: 0.1em; margin: 0 0 1.2rem;">${orderId}</p>

        <p style="color: #8a8478; font-size: 0.7rem; letter-spacing: 0.15em; text-transform: uppercase; margin: 0 0 0.5rem;">Status</p>
        <p style="color: ${color}; font-size: 1.5rem; font-weight: 700; margin: 0 0 1rem;">${emoji} ${status}</p>

        ${adminNotes ? `
          <p style="color: #8a8478; font-size: 0.7rem; letter-spacing: 0.15em; text-transform: uppercase; margin: 0 0 0.5rem;">Message from Designer</p>
          <p style="color: #f5f0e8; font-size: 0.85rem; line-height: 1.6; margin: 0;">${adminNotes}</p>
        ` : ''}
      </div>
      
      <p style="color: #5a5650; font-size: 0.8rem; line-height: 1.6; margin-top: 1rem;">
        If you have any questions, simply reply to this email. Our design team is always here for you.
      </p>
    `)
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 Custom Order status email sent to ${userEmail}`);
  } catch (error) {
    console.error('❌ SMTP Error: Failed to send custom order status to user.', error);
  }
};

export default transporter;
