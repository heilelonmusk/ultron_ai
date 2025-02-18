// scripts/autoUpdateDescriptions.js
import path from 'path';
import { fileURLToPath } from 'url';
import { collectFilePaths, updateDescriptions } from '../src/utils/updateDescriptions.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define base directory (repository root) and metadata file path
const baseDir = process.cwd();
const metadataPath = path.join(baseDir, 'descriptions.json');

// Collect all file paths, excluding directories like node_modules
const fileList = collectFilePaths(baseDir, ['node_modules']);

// Update the metadata file with placeholders for new files
updateDescriptions(metadataPath, fileList);

console.log('Auto-update of descriptions completed successfully.');