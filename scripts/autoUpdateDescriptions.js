// scripts/autoUpdateDescriptions.js
import path from 'path';
import { fileURLToPath } from 'url';
import { collectFilePaths, updateDescriptions } from '../src/utils/updateDescriptions.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseDir = process.cwd();
const metadataPath = path.join(baseDir, 'description.json');

console.log('Base directory:', baseDir);
console.log('Metadata path:', metadataPath);

const fileList = collectFilePaths(baseDir, ['node_modules']);
console.log('Collected', fileList.length, 'file(s).');

updateDescriptions(metadataPath, fileList);
console.log('Auto-update of descriptions completed successfully.');