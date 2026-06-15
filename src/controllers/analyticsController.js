import { Analytics } from '../models/analytics.model.js';

/**
 * Render a gorgeous, high-fidelity glassmorphic Analytics Dashboard HTML page
 */
const renderDashboard = (data) => {
  const successRate = data.deliveries.successRate;
  const attempted = data.deliveries.totalAttempted;
  
  // Calculate SVG stroke offset for the gauge circle (r = 50, circumference = 314.16)
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (successRate / 100) * circumference;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Analytics Dashboard - WaitlistHQ</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #070913;
      --card-bg: rgba(17, 24, 39, 0.7);
      --border: rgba(255, 255, 255, 0.08);
      --text: #f3f4f6;
      --text-muted: #9ca3af;
      --primary: #6366f1;
      --primary-glow: rgba(99, 102, 241, 0.15);
      --emerald: #10b981;
      --rose: #f43f5e;
    }
    body {
      font-family: 'Outfit', -apple-system, sans-serif;
      background-color: var(--bg);
      background-image: 
        radial-gradient(circle at 5% 15%, rgba(99, 102, 241, 0.12) 0%, transparent 35%),
        radial-gradient(circle at 95% 85%, rgba(139, 92, 246, 0.12) 0%, transparent 35%),
        radial-gradient(circle at 50% 50%, #0d1127 0%, #060812 100%);
      color: var(--text);
      min-height: 100vh;
      margin: 0;
      padding: 40px 20px;
      box-sizing: border-box;
    }
    .container {
      max-width: 1100px;
      margin: 0 auto;
    }
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 48px;
    }
    h1 {
      font-size: 32px;
      font-weight: 800;
      margin: 0;
      letter-spacing: -0.03em;
      background: linear-gradient(135deg, #ffffff 40%, #c7d2fe 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .badge {
      background: rgba(99, 102, 241, 0.1);
      border: 1px solid rgba(99, 102, 241, 0.2);
      color: var(--primary);
      padding: 6px 14px;
      border-radius: 9999px;
      font-size: 14px;
      font-weight: 600;
    }
    .grid-kpi {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 24px;
      margin-bottom: 40px;
    }
    .card {
      background: var(--card-bg);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid var(--border);
      border-radius: 24px;
      padding: 32px 28px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05);
      position: relative;
      overflow: hidden;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    .card:hover {
      transform: translateY(-4px);
      box-shadow: 0 20px 40px rgba(99, 102, 241, 0.1);
    }
    .card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 4px;
      background: linear-gradient(90deg, transparent, var(--primary), transparent);
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    .card:hover::before {
      opacity: 1;
    }
    .card-label {
      font-size: 14px;
      color: var(--text-muted);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 12px;
    }
    .card-value {
      font-size: 42px;
      font-weight: 800;
      letter-spacing: -0.02em;
      margin-bottom: 12px;
    }
    .card-sub {
      font-size: 14px;
      color: var(--text-muted);
    }
    .sub-value {
      color: var(--text);
      font-weight: 600;
    }
    .grid-charts {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 24px;
    }
    @media (max-width: 768px) {
      .grid-charts {
        grid-template-columns: 1fr;
      }
    }
    .chart-card {
      display: flex;
      flex-direction: column;
    }
    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    .chart-title {
      font-size: 18px;
      font-weight: 700;
      margin: 0;
    }
    .delivery-meter {
      margin-top: 16px;
    }
    .meter-row {
      margin-bottom: 20px;
    }
    .meter-label-row {
      display: flex;
      justify-content: space-between;
      font-size: 14px;
      margin-bottom: 8px;
    }
    .meter-bar-container {
      height: 8px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 999px;
      overflow: hidden;
    }
    .meter-bar-fill {
      height: 100%;
      border-radius: 999px;
      transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .fill-success {
      background: linear-gradient(90deg, #10b981, #34d399);
      box-shadow: 0 0 10px rgba(16, 185, 129, 0.3);
    }
    .fill-failed {
      background: linear-gradient(90deg, #f43f5e, #fb7185);
      box-shadow: 0 0 10px rgba(244, 63, 94, 0.3);
    }
    .gauge-container {
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;
      height: 180px;
      margin: 20px 0;
    }
    .gauge-svg {
      transform: rotate(-90deg);
    }
    .gauge-bg {
      fill: none;
      stroke: rgba(255, 255, 255, 0.05);
      stroke-width: 10;
    }
    .gauge-fill {
      fill: none;
      stroke: var(--emerald);
      stroke-width: 10;
      stroke-linecap: round;
      transition: stroke-dashoffset 1s ease-out;
    }
    .gauge-text {
      position: absolute;
      font-size: 32px;
      font-weight: 800;
      text-align: center;
    }
    .gauge-text span {
      display: block;
      font-size: 12px;
      color: var(--text-muted);
      font-weight: 500;
      margin-top: 4px;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div>
        <h1>WaitlistHQ</h1>
      </div>
      <span class="badge">Realtime Analytics</span>
    </header>

    <!-- KPI Metric Cards Grid -->
    <div class="grid-kpi">
      <!-- Total Subscribers -->
      <div class="card">
        <div class="card-label">Total Subscribers</div>
        <div class="card-value">${data.subscribers.total}</div>
        <div class="card-sub">
          Active: <span class="sub-value" style="color: var(--emerald)">${data.subscribers.active}</span> | 
          Unsubscribed: <span class="sub-value" style="color: var(--rose)">${data.subscribers.unsubscribed}</span>
        </div>
      </div>

      <!-- Campaigns Sent -->
      <div class="card">
        <div class="card-label">Campaigns Sent</div>
        <div class="card-value">${data.campaigns.sent}</div>
        <div class="card-sub">
          Drafts: <span class="sub-value">${data.campaigns.draft}</span> | 
          Scheduled: <span class="sub-value" style="color: var(--primary)">${data.campaigns.scheduled}</span>
        </div>
      </div>

      <!-- Successful Deliveries -->
      <div class="card">
        <div class="card-label">Emails Delivered</div>
        <div class="card-value" style="color: var(--emerald)">${data.deliveries.sent}</div>
        <div class="card-sub">
          Total attempts: <span class="sub-value">${attempted}</span>
        </div>
      </div>

      <!-- Failed Deliveries -->
      <div class="card">
        <div class="card-label">Failed Deliveries</div>
        <div class="card-value" style="color: ${data.deliveries.failed > 0 ? 'var(--rose)' : 'var(--text)'}">${data.deliveries.failed}</div>
        <div class="card-sub">
          Undelivered campaigns
        </div>
      </div>
    </div>

    <!-- Charts and Delivery Split -->
    <div class="grid-charts">
      <!-- Detailed Delivery Status Bar -->
      <div class="card chart-card">
        <div class="chart-header">
          <h2 class="chart-title">Campaign Delivery Breakdown</h2>
        </div>
        <div class="delivery-meter">
          <!-- Successful -->
          <div class="meter-row">
            <div class="meter-label-row">
              <span>Successful Sends</span>
              <strong>${data.deliveries.sent} (${attempted > 0 ? Math.round((data.deliveries.sent / attempted) * 100) : 100}%)</strong>
            </div>
            <div class="meter-bar-container">
              <div class="meter-bar-fill fill-success" style="width: ${attempted > 0 ? (data.deliveries.sent / attempted) * 100 : 100}%"></div>
            </div>
          </div>
          <!-- Failed -->
          <div class="meter-row">
            <div class="meter-label-row">
              <span>Failed Sends</span>
              <strong>${data.deliveries.failed} (${attempted > 0 ? Math.round((data.deliveries.failed / attempted) * 100) : 0}%)</strong>
            </div>
            <div class="meter-bar-container">
              <div class="meter-bar-fill fill-failed" style="width: ${attempted > 0 ? (data.deliveries.failed / attempted) * 100 : 0}%"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Circular Success Gauge -->
      <div class="card chart-card" style="align-items: center;">
        <div class="chart-header" style="width: 100%;">
          <h2 class="chart-title" style="text-align: center; width: 100%;">Delivery Success</h2>
        </div>
        <div class="gauge-container">
          <svg class="gauge-svg" width="120" height="120">
            <circle class="gauge-bg" cx="60" cy="60" r="50"></circle>
            <circle class="gauge-fill" cx="60" cy="60" r="50" 
                    style="stroke-dasharray: ${circumference}; stroke-dashoffset: ${strokeDashoffset};"></circle>
          </svg>
          <div class="gauge-text">
            ${successRate}%
            <span>Rate</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
  `;
};

/**
 * Fetch and return analytics dashboard or JSON
 * GET /analytics
 */
export const getAnalytics = async (req, res, next) => {
  try {
    const data = Analytics.getOverview();

    // Check if JSON format is explicitly requested via header or query param
    const wantsJson = 
      req.query.format === 'json' || 
      (req.headers.accept && req.headers.accept.includes('application/json'));

    if (wantsJson) {
      return res.status(200).json({
        success: true,
        data
      });
    }

    // Otherwise render visual dashboard
    const html = renderDashboard(data);
    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(html);
  } catch (error) {
    next(error);
  }
};
