// scripts/updateAllVars.js
const fs = require('fs');
const path = require('path');
// Verifica se esiste un file .env nella directory corrente e caricalo
if (fs.existsSync(path.join(process.cwd(), '.env'))) {
  require('dotenv').config();
}
const config = require('../config/envConfig');

// Importa le funzioni di aggiornamento per ogni servizio
const { updateGithubSecret } = require('./updateGithubVars');
const { updateNetlifyVars } = require('./updateNetlifyVars');
// Altri aggiornamenti possono essere aggiunti qui

/**
 * Updates environment variables on all services based on the current configuration.
 */
async function updateAllVars() {
  try {
    if (process.env.UPDATE_GITHUB_VARS === 'true') {
      console.log('Updating GitHub variables...');
      await updateGithubSecret();
    }
    if (process.env.UPDATE_NETLIFY_VARS === 'true') {
      console.log('Updating Netlify variables...');
      await updateNetlifyVars();
    }
    console.log('All variable updates completed successfully.');
  } catch (error) {
    console.error('Error updating variables:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  updateAllVars();
}

module.exports = { updateAllVars };