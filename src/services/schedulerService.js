import cron from 'node-cron';
import { Campaign } from '../models/campaign.model.js';
import { Subscriber } from '../models/subscriber.model.js';
import { sendRawEmail } from './emailService.js';

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

      // 2. Fetch all subscribers
      const subscribers = Subscriber.findAll();
      
      if (subscribers.length === 0) {
        console.log(`[Scheduler] No subscribers found in database. Skipped dispatching campaign ID ${campaign.id}.`);
        continue;
      }

      console.log(`[Scheduler] Dispatching campaign ID ${campaign.id} to ${subscribers.length} subscriber(s)...`);

      for (const subscriber of subscribers) {
        try {
          // Send raw campaign content directly
          await sendRawEmail(subscriber.email, campaign.subject, campaign.content);

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
