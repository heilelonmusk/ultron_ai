// src/utils/updateDescriptions.js
import fs from 'fs';
import path from 'path';

/**
 * Recursively collects relative file paths from a directory,
 * excluding directories with more than a specified number of items.
 *
 * @param {string} dirPath - The directory to scan.
 * @param {string[]} excludeDirs - Directory names to exclude from recursion.
 * @param {number} maxItems - Maximum number of items allowed in a directory to process.
 * @returns {string[]} An array of relative file paths.
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
  
  // Recursive function to update the metadata object without overwriting existing descriptions.
  function setPlaceholder(obj, keys) {
    if (keys.length === 0) return;
    const currentKey = keys[0];
    if (keys.length === 1) {
      // Only set the placeholder if the key does not exist.
      if (!Object.prototype.hasOwnProperty.call(obj, currentKey)) {
        obj[currentKey] = placeholder;
      }
      return;
    }
    // If the key exists but is not an object, convert it into an object to allow nested keys.
    if (obj[currentKey] !== undefined && typeof obj[currentKey] !== 'object') {
      obj[currentKey] = {};
    }
    // If the key does not exist, create it as an empty object.
    if (obj[currentKey] === undefined) {
      obj[currentKey] = {};
    }
    setPlaceholder(obj[currentKey], keys.slice(1));
  }
  
  // Process each file path.
  fileList.forEach(filePath => {
    const keys = filePath.split(path.sep);
    setPlaceholder(metadata, keys);
  });
  
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2), 'utf8');
  console.log('Metadata updated with placeholders.');
}