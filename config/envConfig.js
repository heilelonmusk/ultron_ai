// config/envConfig.js
require('dotenv').config();
/**
 * Loads configuration variables from the environment.
 * It uses process.env and provides default values when necessary.
 */
const config = {
    mongoUri: process.env.MONGO_URI || '',
    redis: {
      host: process.env.REDIS_HOST || '',
      port: process.env.REDIS_PORT || '',
      password: process.env.REDIS_PASSWORD || ''
    },
    githubToken: process.env.MY_GITHUB_TOKEN || '',
    netlifySiteId: process.env.NETLIFY_SITE_ID || '',
    // Aggiungi altre variabili se necessario
  };
  
  module.exports = config;