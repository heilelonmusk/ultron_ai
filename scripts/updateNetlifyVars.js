// scripts/updateNetlifyVars.js
require('dotenv').config();
const fetch = require('node-fetch');

const NETLIFY_API_URL = `https://api.netlify.com/api/v1/sites/${process.env.NETLIFY_SITE_ID}/env`;
const NETLIFY_TOKEN = process.env.NETLIFY_AUTH_TOKEN; // Da salvare nei GitHub Secrets

const envVars = {
  MONGO_URI: process.env.MONGO_URI,
  REDIS_HOST: process.env.REDIS_HOST,
  REDIS_PORT: process.env.REDIS_PORT,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,
  MY_GITHUB_TOKEN: process.env.MY_GITHUB_TOKEN,
  NETLIFY_SITE_ID: process.env.NETLIFY_SITE_ID
};

async function updateNetlifyEnv() {
  for (const [key, value] of Object.entries(envVars)) {
    console.log(`Updating ${key}...`);
    await fetch(`${NETLIFY_API_URL}/${key}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${NETLIFY_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ value })
    });
  }
  console.log('Netlify variables updated.');
}

updateNetlifyEnv();