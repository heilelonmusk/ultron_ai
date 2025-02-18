// scripts/updateAllVars.js
import 'dotenv/config'; // Opzionale, se vuoi che legga variabili da .env
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Se vuoi ottenere il current working dir di questo file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
let cwd;
try {
  cwd = process.cwd();
} catch (error) {
  cwd = __dirname;
}

// Carica .env manualmente se vuoi
if (fs.existsSync(path.join(cwd, '.env'))) {
  // Non possiamo usare require('dotenv').config() in ESM, ma puoi importare 'dotenv/config'
  // Oppure: import dotenv from 'dotenv'; dotenv.config({ path: path.join(cwd, '.env') });
}

// Esempio di import config (dipende da come l’hai convertito)
import config from '../config/envConfig.js';

// Import the update scripts
import { updateGithubSecret } from './updateGithubVars.js';
import { updateNetlifyVars } from './updateNetlifyVars.js';
// More updates here if needed...

/**
 * Updates environment variables on all services based on the current configuration.
 */
export async function updateAllVars() {
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

// If run directly from CLI
if (import.meta.url === process.argv[1] || import.meta.url === new URL(process.argv[1], 'file://').href) {
  updateAllVars();
}