// src/utils/updateDescriptions.js
import fs from 'fs';
import path from 'path';

/**
 * Recursively collects relative file paths from a directory,
 * excluding directories with more than a specified number of items.
 *
 * @param {string} dirPath - The directory to scan.
 * @param {string[]} excludeDirs - Directory names to exclude.
 * @param {number} maxItems - Maximum number of items allowed in a directory to process.
 * @returns {string[]} Array of relative file paths.
 */
export function collectFilePaths(dirPath, excludeDirs = [], maxItems = 100) {
  const filePaths = [];
  
  function walk(currentPath, relativePath) {
    const items = fs.readdirSync(currentPath);
    if (items.length > maxItems) return; // Skip directories with too many items
    items.forEach(item => {
      const fullPath = path.join(currentPath, item);
      const relPath = path.join(relativePath, item);
      let stats;
      try {
        stats = fs.statSync(fullPath);
      } catch {
        return;
      }
      if (stats.isDirectory()) {
        if (!excludeDirs.includes(item)) {
          walk(fullPath, relPath);
        }
      } else {
        filePaths.push(relPath);
      }
    });
  }
  
  walk(dirPath, '');
  return filePaths;
}

/**
 * Updates the metadata file with placeholders for new files.
 *
 * @param {string} metadataPath - The path to the metadata JSON file.
 * @param {string[]} fileList - An array of relative file paths to be ensured in the metadata.
 * @param {string} placeholder - The placeholder text to use for new entries.
 */
export function updateDescriptions(metadataPath, fileList, placeholder = 'No description available') {
  let metadata = {};
  if (fs.existsSync(metadataPath)) {
    try {
      metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    } catch (error) {
      console.error('Error parsing metadata file:', error);
    }
  }
  
  // Funzione ricorsiva per impostare il placeholder
  function setPlaceholder(obj, keys) {
    if (keys.length === 0) return;
    const currentKey = keys[0];
    // Se siamo all'ultimo livello, imposta il placeholder
    if (keys.length === 1) {
      obj[currentKey] = placeholder;
      return;
    }
    // Se la chiave esiste ma non è un oggetto, trasformala in un oggetto (eliminando il valore precedente)
    if (obj[currentKey] !== undefined && typeof obj[currentKey] !== 'object') {
      obj[currentKey] = {};
    }
    // Se la chiave non esiste, creala come oggetto
    if (obj[currentKey] === undefined) {
      obj[currentKey] = {};
    }
    setPlaceholder(obj[currentKey], keys.slice(1));
  }
  
  // Per ogni percorso, crea la struttura dei metadati e imposta il placeholder
  fileList.forEach(filePath => {
    const keys = filePath.split(path.sep);
    setPlaceholder(metadata, keys);
  });
  
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2), 'utf8');
  console.log('Metadata updated with placeholders.');
}