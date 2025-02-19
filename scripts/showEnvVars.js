// scripts/showEnvVars.js
import 'dotenv/config';
import config from '../config/envConfig.js';

console.log('Relevant Environment Variables:');

console.log('REDIS_HOST:', config.redis.host);
console.log('REDIS_PORT:', config.redis.port);
console.log('REDIS_PASSWORD:', config.redis.password);
console.log('MONGO_URI:', config.mongoUri);
console.log('NETLIFY_SITE_ID:', config.netlifySiteId);

// Variabili extra lette direttamente da process.env
console.log('MY_GITHUB_TOKEN:', process.env.MY_GITHUB_TOKEN);
console.log('MY_GITHUB_OWNER:', process.env.MY_GITHUB_OWNER);
console.log('MY_GITHUB_REPO:', process.env.MY_GITHUB_REPO);
console.log('MY_GITHUB_REPO_URL:', process.env.MY_GITHUB_REPO_URL);
console.log('UPDATE_GITHUB_VARS:', process.env.UPDATE_GITHUB_VARS);
console.log('UPDATE_NETLIFY_VARS:', process.env.UPDATE_NETLIFY_VARS);