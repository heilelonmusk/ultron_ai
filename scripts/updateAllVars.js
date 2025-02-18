// scripts/updateAllVars.js
require('dotenv').config(); // Carica il file .env
const config = require('../config/envConfig');

// Importa i moduli di aggiornamento per ogni servizio
const { updateGithubSecret } = require('./updateGithubVars');
const { updateNetlifyVars } = require('./updateNetlifyVars');
// Puoi aggiungere altri aggiornamenti per altri servizi qui
// const { updateAnotherService } = require('./updateAnotherService');

/**
 * Updates environment variables on all services based on the current .env configuration.
 */
async function updateAllVars() {
  try {
    // Controlla se la variabile di flag è impostata (opzionale)
    if (process.env.UPDATE_GITHUB_VARS === 'true') {
      console.log('Updating GitHub variables...');
      await updateGithubSecret();
    }
    if (process.env.UPDATE_NETLIFY_VARS === 'true') {
      console.log('Updating Netlify variables...');
      await updateNetlifyVars();
    }
    // Esempio per altri servizi:
    // if (process.env.UPDATE_ANOTHER_SERVICE === 'true') {
    //   console.log('Updating Another Service variables...');
    //   await updateAnotherService();
    // }
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