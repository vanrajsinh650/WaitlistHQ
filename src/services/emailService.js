import config from '../config/env.js';
import { compileTemplate } from '../utils/templateCompiler.js';

/**
 * Send a templated email using Resend or mock logger
 * @param {string} toEmail - Recipient email address
 * @param {string} subject - Email subject line
 * @param {string} templateName - Name of template (e.g., 'welcome')
 * @param {object} context - Variables to interpolate into the template
 * @returns {Promise<object>} Status of email delivery
 */
export const sendTemplateEmail = async (toEmail, subject, templateName, context = {}) => {
  try {
    const htmlContent = await compileTemplate(templateName, context);

    // Fallback if Resend API key is not configured (mock mode)
    if (!config.resendApiKey || config.resendApiKey === 're_your_api_key_here') {
      console.log('\n=========================================');
      console.log(`  [MOCK EMAIL SERVICE] Email Dispatch (${templateName})`);
      console.log(`  From:    ${config.fromEmail}`);
      console.log(`  To:      ${toEmail}`);
      console.log(`  Subject: ${subject}`);
      console.log(`  Status:  MOCK SENT (No RESEND_API_KEY configured)`);
      console.log(`  Content Preview (Interpolated HTML snippet):`);
      // Print first 300 chars of HTML body for debugging/verification
      const cleanSnippet = htmlContent.replace(/\s+/g, ' ').substring(0, 300);
      console.log(`    ${cleanSnippet}...`);
      console.log('=========================================\n');
      return { mock: true, success: true };
    }

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

    console.log(`[Email Service] ${templateName} email sent successfully to ${toEmail}. ID: ${data.id}`);
    return { success: true, id: data.id };
  } catch (error) {
    console.error(`[Email Service Error] Failed to dispatch ${templateName} email to ${toEmail}:`, error.message);
    throw error;
  }
};

/**
 * Send welcome email to a new subscriber
 * @param {string} toEmail - Recipient email address
 * @returns {Promise<object>} Status of email delivery
 */
export const sendWelcomeEmail = async (toEmail) => {
  return sendTemplateEmail(
    toEmail,
    'Welcome to WaitlistHQ! 🎉',
    'welcome',
    {
      email: toEmail,
      queueNumber: '#482' // Dynamic placeholder for now
    }
  );
};
