import cron from 'node-cron';
import { Campaign } from '../models/campaign.model.js';
import { Subscriber } from '../models/subscriber.model.js';
import { sendRawEmail } from './emailService.js';
import config from '../config/env.js';

// Setup background processing
const processScheduledCampaigns = async () => {
  try {
    const pendingCampaigns = Campaign.findPending();

    if (pendingCampaigns.length === 0) {
      return; // Nothing to process
    }

    console.log(`[Scheduler] Found ${pendingCampaigns.length} pending campaign(s) ready to send.`);

    for (const campaign of pendingCampaigns) {
      console.log(`[Scheduler] Starting processing for campaign: "${campaign.title}" (ID: ${campaign.id})`);

      // 1. Mark campaign as sent immediately to prevent concurrent cron ticks from double-processing
      Campaign.updateStatus(campaign.id, 'sent');

      // 2. Fetch active subscribers only
      const subscribers = Subscriber.findActive();
      
      if (subscribers.length === 0) {
        console.log(`[Scheduler] No active subscribers found in database. Skipped dispatching campaign ID ${campaign.id}.`);
        continue;
      }

      console.log(`[Scheduler] Dispatching campaign ID ${campaign.id} to ${subscribers.length} active subscriber(s)...`);

      for (const subscriber of subscribers) {
        try {
          // Personalize campaign content per subscriber
          const token = subscriber.unsubscribe_token || '';
          const unsubscribeUrl = `${config.baseUrl}/unsubscribe/${token}`;

          let personalizedContent = campaign.content;
          personalizedContent = personalizedContent.replace(/{{email}}/g, subscriber.email);
          personalizedContent = personalizedContent.replace(/{{unsubscribeUrl}}/g, unsubscribeUrl);
          personalizedContent = personalizedContent.replace(/{{unsubscribeToken}}/g, token);

          // Append a compliant unsubscribe footer if it is not present in the content
          if (!personalizedContent.includes(unsubscribeUrl)) {
            personalizedContent += `
              <br><br>
              <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;">
              <p style="font-size: 12px; color: #9ca3af; text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                You are receiving this because you subscribed to our waitlist. 
                <a href="${unsubscribeUrl}" style="color: #4f46e5; text-decoration: underline;">Unsubscribe</a>
              </p>
            `;
          }

          // Send personalized campaign content
          await sendRawEmail(subscriber.email, campaign.subject, personalizedContent);

          // Log successful delivery relationship
          Campaign.createDelivery({
            campaignId: campaign.id,
            subscriberId: subscriber.id,
            status: 'sent',
            sentAt: new Date().toISOString()
          });
        } catch (error) {
          console.error(`[Scheduler Error] Failed to deliver campaign ID ${campaign.id} to subscriber ID ${subscriber.id}:`, error.message);
          
          // Log failed delivery relationship
          Campaign.createDelivery({
            campaignId: campaign.id,
            subscriberId: subscriber.id,
            status: 'failed',
            sentAt: new Date().toISOString(),
            errorMessage: error.message
          });
        }
      }

      console.log(`[Scheduler] Completed processing for campaign: "${campaign.title}" (ID: ${campaign.id})`);
    }
  } catch (error) {
    console.error('[Scheduler Critical Error] Error processing scheduled campaigns:', error.message);
  }
};

// Start the Cron Job: Run once every minute
const schedulerJob = cron.schedule('* * * * *', () => {
  console.log('[Scheduler] Ticking: Checking for scheduled campaigns...');
  processScheduledCampaigns();
});

console.log('[Scheduler Service] Scheduler initialized. Cron job set to process pending campaigns every minute.');

export default schedulerJob;
