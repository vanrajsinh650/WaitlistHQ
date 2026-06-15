import db from '../config/database.js';

export const Campaign = {
  /**
   * Create a new campaign record
   * @param {object} data - Campaign properties
   * @param {string} data.title - Campaign title
   * @param {string} data.subject - Campaign email subject
   * @param {string} data.content - Campaign content
   * @param {string} [data.status='draft'] - Status ('draft', 'scheduled', 'sent')
   * @param {string} [data.send_at] - DateTime string
   * @returns {object} The created campaign record
   */
  create(data) {
    const status = data.status || 'draft';
    const sendAt = data.send_at || null;

    const stmt = db.prepare(`
      INSERT INTO campaigns (title, subject, content, status, send_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    const info = stmt.run(data.title, data.subject, data.content, status, sendAt);
    return this.findById(info.lastInsertRowid);
  },

  /**
   * Find a campaign by ID
   * @param {number|string} id - Campaign database ID
   * @returns {object|undefined} Campaign record or undefined
   */
  findById(id) {
    const stmt = db.prepare(`
      SELECT * FROM campaigns
      WHERE id = ?
    `);
    return stmt.get(id);
  },

  /**
   * Get all campaigns
   * @returns {array} Array of campaign records
   */
  findAll() {
    const stmt = db.prepare(`
      SELECT * FROM campaigns
      ORDER BY created_at DESC
    `);
    return stmt.all();
  },

  /**
   * Create a delivery log associating a campaign to a subscriber
   * @param {object} data - Delivery properties
   * @param {number} data.campaignId - Campaign ID
   * @param {number} data.subscriberId - Subscriber ID
   * @param {string} [data.status='pending'] - Delivery status ('pending', 'sent', 'failed')
   * @param {string} [data.sentAt] - DateTime string
   * @param {string} [data.errorMessage] - Logging message if it fails
   * @returns {object} The created delivery record
   */
  createDelivery(data) {
    const status = data.status || 'pending';
    const sentAt = data.sentAt || null;
    const errorMessage = data.errorMessage || null;

    const stmt = db.prepare(`
      INSERT INTO campaign_deliveries (campaign_id, subscriber_id, status, sent_at, error_message)
      VALUES (?, ?, ?, ?, ?)
    `);

    const info = stmt.run(data.campaignId, data.subscriberId, status, sentAt, errorMessage);
    
    // Fetch and return the inserted delivery log
    const getStmt = db.prepare('SELECT * FROM campaign_deliveries WHERE id = ?');
    return getStmt.get(info.lastInsertRowid);
  },

  /**
   * Retrieve all deliveries for a specific campaign joined with subscriber details (SQL JOIN)
   * @param {number|string} campaignId - Campaign ID
   * @returns {array} List of deliveries containing subscriber information
   */
  getDeliveries(campaignId) {
    const stmt = db.prepare(`
      SELECT 
        cd.id AS delivery_id,
        cd.campaign_id,
        cd.subscriber_id,
        cd.status AS delivery_status,
        cd.sent_at AS delivery_sent_at,
        cd.error_message,
        s.email AS subscriber_email,
        s.status AS subscriber_status
      FROM campaign_deliveries cd
      JOIN subscribers s ON cd.subscriber_id = s.id
      WHERE cd.campaign_id = ?
      ORDER BY cd.id ASC
    `);
    return stmt.all(campaignId);
  }
};
