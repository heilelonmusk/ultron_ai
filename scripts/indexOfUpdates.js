// scripts/indexOfUpdates.js
import { updateGithubSecret } from './updateGithubVars.js';
import { updateNetlifyVars } from './updateNetlifyVars.js';
import { makeUpdateAllVars } from './updateAllVars.js';

// Creiamo la versione "reale" di updateAllVars
export const updateAllVars = makeUpdateAllVars({
  updateGithubSecret,
  updateNetlifyVars
});

// Se vuoi avviarlo da CLI
if (import.meta.url === process.argv[1] || new URL(process.argv[1], 'file://').href) {
  updateAllVars();
}