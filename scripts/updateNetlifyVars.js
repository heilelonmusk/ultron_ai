// scripts/updateNetlifyVars.js
const fetch = require('node-fetch');
const config = require('../config/envConfig'); // Se usi un modulo di config per le variabili

/**
 * Updates a Netlify environment variable (example: MONGO_URI).
 * @returns {Promise<void>}
 */
async function updateNetlifyVars() {
  const netlifySiteId = process.env.NETLIFY_SITE_ID || config.netlifySiteId;
  const netlifyAuthToken = process.env.NETLIFY_AUTH_TOKEN || config.netlifyAuthToken;
  const mongoUri = process.env.MONGO_URI || config.mongoUri;

  if (!netlifySiteId || !netlifyAuthToken) {
    throw new Error('Netlify site ID or auth token is missing.');
  }

  // Endpoint di esempio per aggiornare la variabile MONGO_URI su Netlify
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

// Se il modulo viene eseguito direttamente, esegue la funzione
if (require.main === module) {
  updateNetlifyVars().catch(err => {
    console.error(err);
    process.exit(1);
  });
}

// Esporta la funzione per i test ed eventuali altri moduli
module.exports = { updateNetlifyVars };