// src/utils/updateDescriptions.js
import fs from 'fs';
import path from 'path';

/**
 * Recursively collects relative file paths from a directory,
 * excluding directories with more than a specified number of items.
 */
export function collectFilePaths(dirPath, excludeDirs = [], maxItems = 100) {
  const filePaths = [];
  
  function walk(currentPath, relativePath) {
    const items = fs.readdirSync(currentPath);
    if (items.length > maxItems) return;
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
 */
export function updateDescriptions(
  metadataPath,
  fileList,
  placeholder = 'No description available'
) {
  let metadata = {};
  if (fs.existsSync(metadataPath)) {
    try {
      metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    } catch (error) {
      console.error('Error parsing metadata file:', error);
    }
  }
  
  function setPlaceholder(obj, keys) {
    if (keys.length === 1) {
      if (!obj[keys[0]]) {
        obj[keys[0]] = placeholder;
      }
      return;
    }
    const key = keys.shift();
    if (!obj[key]) {
      obj[key] = {};
    }
    setPlaceholder(obj[key], keys);
  }
  
  fileList.forEach(filePath => {
    const keys = filePath.split(path.sep);
    setPlaceholder(metadata, keys);
  });
  
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2), 'utf8');
  console.log('Metadata updated with placeholders.');
}