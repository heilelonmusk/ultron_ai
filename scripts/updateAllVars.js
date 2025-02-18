// scripts/updateAllVars.js
import 'dotenv/config'; // Carica .env se desideri

/**
 * Invece di importare direttamente updateGithubSecret e updateNetlifyVars,
 * creiamo una factory che li riceve come parametri in un oggetto.
 *
 * @param {Object} deps - Oggetto con { updateGithubSecret, updateNetlifyVars }
 * @returns {Function} updateAllVars - la funzione che aggiorna le var su GH e Netlify
 */
export function makeUpdateAllVars({ updateGithubSecret, updateNetlifyVars }) {
  return async function updateAllVars() {
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
  };
}

/**
 * Se vuoi comunque un'istanza "reale" per l'esecuzione in produzione, puoi
 * importare *qui* i moduli updateGithubSecret e updateNetlifyVars, e creare
 * un'istanza "ufficiale". Per esempio:
 *
 * import { updateGithubSecret } from './updateGithubVars.js';
 * import { updateNetlifyVars } from './updateNetlifyVars.js';
 *
 * // export const updateAllVars = makeUpdateAllVars({
 * //   updateGithubSecret,
 * //   updateNetlifyVars
 * // });
 *
 * // if (import.meta.url === process.argv[1] || new URL(process.argv[1], 'file://').href) {
 * //   updateAllVars();
 * // }
 *
 * Oppure spostare questo "assemblaggio" in un file "indexOfUpdates.js"
 * separato, se preferisci.
 */