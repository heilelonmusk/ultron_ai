// scripts/showEnvVars.js
require('dotenv').config(); // Questo è utile per lo sviluppo locale
const config = require('../config/envConfig');

console.log('Relevant Environment Variables:');
console.log('REDIS_HOST:', config.redis.host);
console.log('REDIS_PORT:', config.redis.port);
console.log('REDIS_PASSWORD:', config.redis.password);
console.log('MONGO_URI:', config.mongoUri);
console.log('NETLIFY_SITE_ID:', config.netlifySiteId);
console.log('NETLIFY_AUTH_TOKEN:', config.netlifyAuthToken);