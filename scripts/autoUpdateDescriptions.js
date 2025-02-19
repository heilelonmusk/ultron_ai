// scripts/autoUpdateDescriptions.js
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { collectFilePaths, updateDescriptions } from '../src/utils/updateDescriptions.js';

// Determina il percorso del file corrente e della cartella corrente
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Usa process.cwd() per ottenere la root del repository (che in GitHub Actions è $GITHUB_WORKSPACE)
const baseDir = process.cwd();
const metadataPath = path.join(baseDir, 'description.json');

console.log('Base directory:', baseDir);
console.log('Metadata path:', metadataPath);

// Se description.json non esiste, inizializzalo come oggetto vuoto
if (!fs.existsSync(metadataPath)) {
  fs.writeFileSync(metadataPath, JSON.stringify({}, null, 2), 'utf8');
  console.log('Initialized description.json as empty object.');
}

// Raccogli tutti i percorsi dei file, escludendo "node_modules"
const fileList = collectFilePaths(baseDir, ['node_modules']);
console.log(`Collected ${fileList.length} file(s).`);

// Aggiorna il file dei metadati con i placeholder
updateDescriptions(metadataPath, fileList);
console.log('Auto-update of descriptions completed successfully.');