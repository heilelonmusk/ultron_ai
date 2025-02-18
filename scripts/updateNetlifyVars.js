// scripts/updateNetlifyVars.js
import 'dotenv/config';
import fetch from 'node-fetch';
import config from '../config/envConfig.js';

/**
 * Updates a Netlify environment variable (example: MONGO_URI).
 * @returns {Promise<void>}
 */
export async function updateNetlifyVars() {
  const netlifySiteId = process.env.NETLIFY_SITE_ID || config.netlifySiteId;
  const netlifyAuthToken = process.env.NETLIFY_AUTH_TOKEN || config.netlifyAuthToken;
  const mongoUri = process.env.MONGO_URI || config.mongoUri;

  if (!netlifySiteId || !netlifyAuthToken) {
    throw new Error('Netlify site ID or auth token is missing.');
  }

  const apiUrl = `https://api.netlify.com/api/v1/sites/${netlifySiteId}/env/MONGO_URI`;

  const response = await fetch(apiUrl, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${netlifyAuthToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ value: mongoUri })
  });

  if (!response.ok) {
    throw new Error(`Netlify API responded with ${response.status}`);
  }

  console.log('Netlify variables updated successfully.');
}

if (import.meta.url === process.argv[1] || import.meta.url === new URL(process.argv[1], 'file://').href) {
  updateNetlifyVars().catch(err => {
    console.error(err);
    process.exit(1);
  });
}