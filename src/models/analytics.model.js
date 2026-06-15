import db from '../config/database.js';

export const Analytics = {
  /**
   * Get waitlist and campaign delivery performance metrics
   * @returns {object} Aggregated metrics
   */
  getOverview() {
    // Subscriber metrics
    const totalSubscribers = db.prepare("SELECT COUNT(*) AS count FROM subscribers").get().count;
    const activeSubscribers = db.prepare("SELECT COUNT(*) AS count FROM subscribers WHERE status = 'active'").get().count;
    const unsubscribedSubscribers = db.prepare("SELECT COUNT(*) AS count FROM subscribers WHERE status = 'unsubscribed'").get().count;
    
    // Campaign metrics
    const campaignsSent = db.prepare("SELECT COUNT(*) AS count FROM campaigns WHERE status = 'sent'").get().count;
    const campaignsScheduled = db.prepare("SELECT COUNT(*) AS count FROM campaigns WHERE status = 'scheduled'").get().count;
    const campaignsDraft = db.prepare("SELECT COUNT(*) AS count FROM campaigns WHERE status = 'draft'").get().count;
    const totalCampaigns = campaignsSent + campaignsScheduled + campaignsDraft;
    
    // Delivery/Email metrics (from campaign_deliveries)
    const emailsSent = db.prepare("SELECT COUNT(*) AS count FROM campaign_deliveries WHERE status = 'sent'").get().count;
    const emailsFailed = db.prepare("SELECT COUNT(*) AS count FROM campaign_deliveries WHERE status = 'failed'").get().count;
    const totalAttempted = emailsSent + emailsFailed;
    
    const successRate = totalAttempted > 0 
      ? parseFloat(((emailsSent / totalAttempted) * 100).toFixed(2)) 
      : 100.00;

    return {
      subscribers: {
        total: totalSubscribers,
        active: activeSubscribers,
        unsubscribed: unsubscribedSubscribers
      },
      campaigns: {
        total: totalCampaigns,
        sent: campaignsSent,
        scheduled: campaignsScheduled,
        draft: campaignsDraft
      },
      deliveries: {
        sent: emailsSent,
        failed: emailsFailed,
        totalAttempted,
        successRate
      }
    };
  }
};

export default Analytics;
