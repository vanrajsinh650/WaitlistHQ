import { Subscriber } from '../models/subscriber.model.js';
import config from '../config/env.js';

/**
 * Render a premium, responsive glassmorphic status screen
 */
const renderFeedbackPage = (title, message, buttonText, buttonUrl, isSuccess = true) => {
  const accentColor = isSuccess ? '#10b981' : '#ef4444';
  const icon = isSuccess ? '✓' : '✕';
  const buttonGradient = isSuccess 
    ? 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' 
    : 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)';
  const buttonShadow = isSuccess
    ? 'rgba(99, 102, 241, 0.3)'
    : 'rgba(239, 68, 68, 0.3)';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - WaitlistHQ</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #0b0f19;
      --card-bg: rgba(17, 24, 39, 0.75);
      --border: rgba(255, 255, 255, 0.08);
      --text: #f3f4f6;
      --text-muted: #9ca3af;
    }
    body {
      font-family: 'Outfit', -apple-system, sans-serif;
      background-color: var(--bg);
      background-image: 
        radial-gradient(circle at 10% 20%, rgba(79, 70, 229, 0.15) 0%, transparent 40%),
        radial-gradient(circle at 90% 80%, rgba(124, 58, 237, 0.15) 0%, transparent 40%),
        radial-gradient(circle at 50% 50%, #0c1020 0%, #05070c 100%);
      color: var(--text);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0;
      padding: 20px;
      box-sizing: border-box;
    }
    .card {
      background: var(--card-bg);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid var(--border);
      border-radius: 28px;
      padding: 48px 32px;
      max-width: 460px;
      width: 100%;
      text-align: center;
      box-shadow: 0 24px 60px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1);
      transform: translateY(0);
      transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease;
    }
    .card:hover {
      transform: translateY(-6px);
      box-shadow: 0 32px 72px rgba(124, 58, 237, 0.18);
    }
    .icon-wrapper {
      width: 84px;
      height: 84px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid var(--border);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 32px;
      box-shadow: 0 8px 16px rgba(0,0,0,0.2);
    }
    .icon {
      color: ${accentColor};
      font-size: 36px;
      font-weight: 800;
      line-height: 1;
    }
    h1 {
      font-size: 30px;
      font-weight: 800;
      margin: 0 0 16px;
      letter-spacing: -0.03em;
      background: linear-gradient(135deg, #ffffff 30%, #a5b4fc 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    p {
      font-size: 16px;
      color: var(--text-muted);
      line-height: 1.6;
      margin: 0 0 36px;
    }
    .action-btn {
      display: inline-block;
      background: ${buttonGradient};
      color: #ffffff;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 14px;
      font-weight: 600;
      font-size: 15px;
      transition: all 0.2s ease;
      box-shadow: 0 6px 20px ${buttonShadow};
    }
    .action-btn:hover {
      transform: scale(1.03);
      box-shadow: 0 8px 24px ${buttonShadow};
      filter: brightness(1.1);
    }
    .footer {
      margin-top: 36px;
      font-size: 12px;
      color: rgba(255, 255, 255, 0.2);
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon-wrapper">
      <span class="icon">${icon}</span>
    </div>
    <h1>${title}</h1>
    <p>${message}</p>
    ${buttonText && buttonUrl ? `<a href="${buttonUrl}" class="action-btn">${buttonText}</a>` : ''}
    <div class="footer">
      WaitlistHQ • Simplicity in Automation
    </div>
  </div>
</body>
</html>
  `;
};

/**
 * Handle unsubscribe request
 * GET /unsubscribe/:token
 */
export const unsubscribeSubscriber = async (req, res, next) => {
  try {
    const { token } = req.params;

    if (!token) {
      const html = renderFeedbackPage(
        'Invalid Link',
        'No unsubscribe token was provided. If you copied the link, please double check you copied it in full.',
        null,
        null,
        false
      );
      return res.status(400).send(html);
    }

    const subscriber = Subscriber.findByUnsubscribeToken(token);

    if (!subscriber) {
      const html = renderFeedbackPage(
        'Link Expired or Invalid',
        'This unsubscribe link appears to be invalid or expired. If you need help, please contact support.',
        null,
        null,
        false
      );
      return res.status(404).send(html);
    }

    // Update status to unsubscribed
    Subscriber.updateStatus(subscriber.id, 'unsubscribed');

    console.log(`[Unsubscribe System] Subscriber ${subscriber.email} unsubscribed successfully.`);

    const html = renderFeedbackPage(
      'Unsubscribed',
      `We have successfully removed <strong>${subscriber.email}</strong> from our waitlist. You will no longer receive any updates or announcement emails from us.`,
      'Oops, resubscribe me',
      `${config.baseUrl}/resubscribe/${token}`,
      true
    );

    return res.status(200).send(html);
  } catch (error) {
    next(error);
  }
};

/**
 * Handle resubscribe request
 * GET /resubscribe/:token
 */
export const resubscribeSubscriber = async (req, res, next) => {
  try {
    const { token } = req.params;

    if (!token) {
      const html = renderFeedbackPage(
        'Invalid Link',
        'No token was provided. Re-subscription failed.',
        null,
        null,
        false
      );
      return res.status(400).send(html);
    }

    const subscriber = Subscriber.findByUnsubscribeToken(token);

    if (!subscriber) {
      const html = renderFeedbackPage(
        'Link Expired or Invalid',
        'Could not locate subscriber for this token. Re-subscription failed.',
        null,
        null,
        false
      );
      return res.status(404).send(html);
    }

    // Set status back to active
    Subscriber.updateStatus(subscriber.id, 'active');

    console.log(`[Unsubscribe System] Subscriber ${subscriber.email} resubscribed successfully.`);

    const html = renderFeedbackPage(
      'Welcome Back! 🎉',
      `You have been successfully re-subscribed. <strong>${subscriber.email}</strong> is active again, and you will continue receiving waitlist updates.`,
      'Visit WaitlistHQ',
      `${config.baseUrl}/`,
      true
    );

    return res.status(200).send(html);
  } catch (error) {
    next(error);
  }
};
