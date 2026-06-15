import config from '../config/env.js';

/**
 * Generate a premium welcome HTML email template
 * @param {string} email - Recipient email
 * @returns {string} HTML content
 */
const getWelcomeTemplate = (email) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to WaitlistHQ</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          background-color: #f9fafb;
          margin: 0;
          padding: 0;
          color: #111827;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background: #ffffff;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          border: 1px solid #e5e7eb;
        }
        .header {
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          padding: 40px 20px;
          text-align: center;
        }
        .header h1 {
          color: #ffffff;
          margin: 0;
          font-size: 28px;
          font-weight: 800;
          letter-spacing: -0.025em;
        }
        .content {
          padding: 40px 30px;
          line-height: 1.6;
        }
        .content h2 {
          font-size: 20px;
          font-weight: 700;
          margin-top: 0;
          color: #1f2937;
        }
        .content p {
          color: #4b5563;
          font-size: 16px;
          margin-bottom: 24px;
        }
        .badge {
          display: inline-block;
          background-color: #e0e7ff;
          color: #4f46e5;
          padding: 6px 12px;
          border-radius: 9999px;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 20px;
        }
        .footer {
          background-color: #f3f4f6;
          padding: 24px;
          text-align: center;
          border-top: 1px solid #e5e7eb;
        }
        .footer p {
          margin: 0;
          color: #9ca3af;
          font-size: 13px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>WaitlistHQ</h1>
        </div>
        <div class="content">
          <span class="badge">Joined Successfully</span>
          <h2>You're on the list! 🎉</h2>
          <p>Hi there,</p>
          <p>Thank you for signing up. We've added <strong>${email}</strong> to our priority queue. You are officially in line to receive early access to the most advanced email automation platform ever built.</p>
          <p>We will keep you updated with progress, behind-the-scenes previews, and notify you as soon as your spot is ready.</p>
          <p>Best regards,<br>The WaitlistHQ Team</p>
        </div>
        <div class="footer">
          <p>© 2026 WaitlistHQ. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Send welcome email to a new subscriber
 * @param {string} toEmail - Recipient email address
 * @returns {Promise<object>} Status of email delivery
 */
export const sendWelcomeEmail = async (toEmail) => {
  const subject = 'Welcome to WaitlistHQ! 🎉';
  const htmlContent = getWelcomeTemplate(toEmail);

  // Fallback if Resend API key is not configured (mock mode)
  if (!config.resendApiKey || config.resendApiKey === 're_your_api_key_here') {
    console.log('\n=========================================');
    console.log('  [MOCK EMAIL SERVICE] Welcome Email Dispatch');
    console.log(`  From:    ${config.fromEmail}`);
    console.log(`  To:      ${toEmail}`);
    console.log(`  Subject: ${subject}`);
    console.log('  Status:  MOCK SENT (No RESEND_API_KEY configured)');
    console.log('=========================================\n');
    return { mock: true, success: true };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: config.fromEmail,
        to: toEmail,
        subject: subject,
        html: htmlContent
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `Failed to send email. Resend status code: ${response.status}`);
    }

    console.log(`[Email Service] Welcome email sent successfully to ${toEmail}. ID: ${data.id}`);
    return { success: true, id: data.id };
  } catch (error) {
    console.error(`[Email Service Error] Failed to send welcome email to ${toEmail}:`, error.message);
    throw error;
  }
};
