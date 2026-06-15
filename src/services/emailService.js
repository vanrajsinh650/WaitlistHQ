import nodemailer from 'nodemailer';
import config from '../config/env.js';
import { compileTemplate } from '../utils/templateCompiler.js';
import { Subscriber } from '../models/subscriber.model.js';
import logger from '../utils/logger.js';

// --- Gmail Transporter Setup ---
let transporter = null;

/**
 * Initialize the Nodemailer transporter with Gmail credentials
 */
const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: config.email,
        pass: config.appPassword
      }
    });
    logger.info(`[Email Service] Gmail transporter initialized for ${config.email}`);
  }
  return transporter;
};

/**
 * Strip HTML tags to produce a plain-text version of an email.
 * This ensures every email has both text and html parts,
 * which is critical for avoiding spam filters.
 * @param {string} html - The HTML content
 * @returns {string} Plain text version
 */
const htmlToPlainText = (html) => {
  return html
    .replace(/<br\s*\/?>/gi, '\n')           // <br> → newline
    .replace(/<\/p>/gi, '\n\n')              // </p> → double newline
    .replace(/<\/h[1-6]>/gi, '\n\n')         // </h1-6> → double newline
    .replace(/<\/li>/gi, '\n')               // </li> → newline
    .replace(/<li[^>]*>/gi, '  - ')          // <li> → bullet
    .replace(/<\/tr>/gi, '\n')               // </tr> → newline
    .replace(/<\/td>/gi, '\t')               // </td> → tab
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')  // remove <style> blocks
    .replace(/<[^>]+>/g, '')                 // strip remaining tags
    .replace(/&nbsp;/g, ' ')                 // &nbsp; → space
    .replace(/&amp;/g, '&')                  // &amp; → &
    .replace(/&lt;/g, '<')                   // &lt; → <
    .replace(/&gt;/g, '>')                   // &gt; → >
    .replace(/&#39;/g, "'")                  // &#39; → '
    .replace(/&quot;/g, '"')                 // &quot; → "
    .replace(/\n{3,}/g, '\n\n')              // collapse excess newlines
    .trim();
};

/**
 * Send an email using Gmail (Nodemailer) with both text and HTML parts.
 * Sending both parts is essential to pass spam filters.
 * @param {string} toEmail - Recipient email address
 * @param {string} subject - Email subject line
 * @param {string} htmlContent - HTML body content
 * @returns {Promise<object>} Status of email delivery
 */
export const sendRawEmail = async (toEmail, subject, htmlContent) => {
  // Fallback if Gmail credentials are not configured (mock mode)
  if (!config.email || !config.appPassword) {
    logger.info(`[MOCK EMAIL SERVICE] Raw Email Dispatch | To: ${toEmail} | Subject: ${subject}`);
    const cleanSnippet = htmlContent.replace(/\s+/g, ' ').substring(0, 300);
    logger.debug(`[MOCK EMAIL SERVICE] Content Preview: ${cleanSnippet}...`);
    return { mock: true, success: true };
  }

  try {
    const transport = getTransporter();

    // Generate plain-text version from HTML (anti-spam best practice)
    const plainText = htmlToPlainText(htmlContent);

    const mailOptions = {
      from: `WaitlistHQ <${config.email}>`,
      to: toEmail,
      subject: subject,
      text: plainText,   // Plain-text version (spam filters check for this)
      html: htmlContent,  // HTML version
      headers: {
        'X-Mailer': 'WaitlistHQ/1.0',
        'List-Unsubscribe': `<${config.baseUrl}/unsubscribe>`,
      }
    };

    const info = await transport.sendMail(mailOptions);

    logger.info(`[Email Service] Email sent successfully to ${toEmail}. MessageID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error(`[Email Service Error] Failed to send email to ${toEmail}: ${error.message}`, error);
    throw error;
  }
};

/**
 * Send a templated email using Gmail (Nodemailer)
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
    'Thanks for joining the WaitlistHQ waitlist',
    'welcome',
    {
      email: toEmail
    }
  );
};
