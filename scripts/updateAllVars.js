// scripts/updateAllVars.js
const fs = require('fs');
const path = require('path');

// Prova a ottenere il current working directory, altrimenti usa __dirname
let cwd;
try {
  cwd = process.cwd();
} catch (error) {
  cwd = __dirname;
}

// Se esiste un file .env nel working directory, caricalo
if (fs.existsSync(path.join(cwd, '.env'))) {
  require('dotenv').config({ path: path.join(cwd, '.env') });
}

const config = require('../config/envConfig');

// Importa le funzioni di aggiornamento per ogni servizio
const { updateGithubSecret } = require('./updateGithubVars');
const { updateNetlifyVars } = require('./updateNetlifyVars');
// Puoi aggiungere altri aggiornamenti per altri servizi qui

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