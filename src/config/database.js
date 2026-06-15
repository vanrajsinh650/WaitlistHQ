import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve path to the database file in the project root
const dbPath = path.resolve(__dirname, '../../database.sqlite');

console.log(`Connecting to SQLite database at: ${dbPath}`);

const db = new Database(dbPath, {
  // Option to log queries for educational purposes during development
  verbose: (message) => console.log(`[SQL] ${message}`)
});

// Enable WAL mode for better performance and concurrency
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Create the tables if they don't exist
const initializeDatabase = () => {
  const schema = `
    CREATE TABLE IF NOT EXISTS subscribers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS campaigns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      subject TEXT NOT NULL,
      content TEXT NOT NULL,
      status TEXT DEFAULT 'draft',
      send_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS campaign_deliveries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      campaign_id INTEGER NOT NULL,
      subscriber_id INTEGER NOT NULL,
      status TEXT DEFAULT 'pending',
      sent_at DATETIME,
      error_message TEXT,
      FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
      FOREIGN KEY (subscriber_id) REFERENCES subscribers(id) ON DELETE CASCADE
    );
  `;
  
  db.exec(schema);
  console.log('Database tables initialized successfully.');
};

// Initialize schema on startup
initializeDatabase();

export default db;
