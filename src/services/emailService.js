import config from '../config/env.js';
import { compileTemplate } from '../utils/templateCompiler.js';
import { Subscriber } from '../models/subscriber.model.js';
import logger from '../utils/logger.js';

/**
 * Send a raw HTML email using Resend or mock logger
 * @param {string} toEmail - Recipient email address
 * @param {string} subject - Email subject line
 * @param {string} htmlContent - Custom HTML body content
 * @returns {Promise<object>} Status of email delivery
 */
export const sendRawEmail = async (toEmail, subject, htmlContent) => {
  // Fallback if Resend API key is not configured (mock mode)
  if (!config.resendApiKey || config.resendApiKey === 're_your_api_key_here') {
    logger.info(`[MOCK EMAIL SERVICE] Raw Email Dispatch | From: ${config.fromEmail} | To: ${toEmail} | Subject: ${subject}`);
    const cleanSnippet = htmlContent.replace(/\s+/g, ' ').substring(0, 300);
    logger.debug(`[MOCK EMAIL SERVICE] Content Preview: ${cleanSnippet}...`);
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

    logger.info(`[Email Service] Raw email sent successfully to ${toEmail}. ID: ${data.id}`);
    return { success: true, id: data.id };
  } catch (error) {
    logger.error(`[Email Service Error] Failed to dispatch raw email to ${toEmail}: ${error.message}`, error);
    throw error;
  }
};

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
    // Look up subscriber to get their unsubscribe token
    const subscriber = Subscriber.findByEmail(toEmail);
    const token = subscriber ? subscriber.unsubscribe_token : '';
    const unsubscribeUrl = `${config.baseUrl}/unsubscribe/${token}`;

    const enrichedContext = {
      unsubscribeUrl,
      unsubscribeToken: token,
      ...context
    };

    const htmlContent = await compileTemplate(templateName, enrichedContext);
    return sendRawEmail(toEmail, subject, htmlContent);
  } catch (error) {
    logger.error(`[Email Service Error] Failed to compile template ${templateName} for ${toEmail}: ${error.message}`, error);
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
