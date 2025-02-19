// scripts/autoUpdateDescriptions.js
import path from 'path';
import { fileURLToPath } from 'url';
import { collectFilePaths, updateDescriptions } from '../src/utils/updateDescriptions.js';

// Determina il percorso della directory corrente (repository root)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const baseDir = process.cwd();

// Specifica il percorso del file dei metadati (description.json) nella root
const metadataPath = path.join(baseDir, 'description.json');

// Raccoglie tutti i percorsi relativi dei file, escludendo directory come node_modules
const fileList = collectFilePaths(baseDir, ['node_modules']);

// Aggiorna il file dei metadati con placeholder per eventuali descrizioni mancanti
updateDescriptions(metadataPath, fileList);

console.log('Auto-update of descriptions completed successfully.');