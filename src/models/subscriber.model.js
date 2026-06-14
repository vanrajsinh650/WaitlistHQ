import db from '../config/database.js';

export const Subscriber = {
  /**
   * Create a new subscriber record
   * @param {string} email - Subscriber email
   * @returns {object} The created subscriber record
   */
  create(email) {
    const stmt = db.prepare(`
      INSERT INTO subscribers (email)
      VALUES (?)
    `);
    const info = stmt.run(email);
    
    // Retrieve and return the newly created row
    return this.findById(info.lastInsertRowid);
  },

  /**
   * Find a subscriber by ID
   * @param {number|string} id - Subscriber database ID
   * @returns {object|undefined} The subscriber record or undefined
   */
  findById(id) {
    const stmt = db.prepare(`
      SELECT * FROM subscribers
      WHERE id = ?
    `);
    return stmt.get(id);
  },

  /**
   * Find a subscriber by Email
   * @param {string} email - Subscriber email
   * @returns {object|undefined} The subscriber record or undefined
   */
  findByEmail(email) {
    const stmt = db.prepare(`
      SELECT * FROM subscribers
      WHERE email = ?
    `);
    return stmt.get(email);
  },

  /**
   * Get all subscribers
   * @returns {array} Array of all subscriber records
   */
  findAll() {
    const stmt = db.prepare(`
      SELECT * FROM subscribers
      ORDER BY created_at DESC
    `);
    return stmt.all();
  },

  /**
   * Delete a subscriber by ID
   * @param {number|string} id - Subscriber database ID
   * @returns {number} The number of rows deleted (0 or 1)
   */
  delete(id) {
    const stmt = db.prepare(`
      DELETE FROM subscribers
      WHERE id = ?
    `);
    const info = stmt.run(id);
    return info.changes;
  }
};
