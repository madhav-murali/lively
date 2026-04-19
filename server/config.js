import 'dotenv/config';

const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/lively',
  webhookUrl: process.env.WEBHOOK_URL || '',
  pingTimeout: parseInt(process.env.PING_TIMEOUT || '10000', 10),
  defaultInterval: parseInt(process.env.DEFAULT_INTERVAL || '60', 10),
  isProduction: process.env.NODE_ENV === 'production',
};

export default config;
