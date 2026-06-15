import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
  isTest: process.env.NODE_ENV === 'test',
  resendApiKey: process.env.RESEND_API_KEY,
  fromEmail: process.env.FROM_EMAIL || 'WaitlistHQ <onboarding@resend.dev>',
};

// Simple validation
if (isNaN(config.port)) {
  throw new Error('Configuration error: PORT must be a valid number.');
}

export default config;
