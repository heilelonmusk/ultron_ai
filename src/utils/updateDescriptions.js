// src/utils/updateDescriptions.js
const fs = require('fs');
const path = require('path');

/**
 * Recursively collects relative file paths from a directory,
 * excluding directories with more than a specified number of items.
 * @param {string} dirPath - The directory to scan.
 * @param {string[]} excludeDirs - Directory names to exclude from recursion.
 * @param {number} maxItems - Maximum number of items allowed in a directory to process.
 * @returns {string[]} An array of relative file paths.
 */
function collectFilePaths(dirPath, excludeDirs = [], maxItems = 100) {
  let filePaths = [];
  
  function walk(currentPath, relativePath) {
    let items = fs.readdirSync(currentPath);
    if (items.length > maxItems) return; // Skip directories with too many items
    items.forEach(item => {
      const fullPath = path.join(currentPath, item);
      const relPath = path.join(relativePath, item);
      let stats;
      try {
        stats = fs.statSync(fullPath);
      } catch (err) {
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
 * @param {string} metadataPath - The path to the metadata JSON file.
 * @param {string[]} fileList - An array of relative file paths to be ensured in the metadata.
 * @param {string} placeholder - The placeholder text to use for new entries.
 */
function updateDescriptions(metadataPath, fileList, placeholder = "No description available") {
  let metadata = {};
  if (fs.existsSync(metadataPath)) {
    try {
      metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    } catch (error) {
      console.error("Error parsing metadata file:", error);
    }
  }
  
  // Function to recursively set placeholder for a given key path in an object.
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
  
  // For each file path, split it by path separator and ensure it exists in the metadata.
  fileList.forEach(filePath => {
    const keys = filePath.split(path.sep);
    setPlaceholder(metadata, keys);
  });
  
  // Write the updated metadata back to file.
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2), 'utf8');
  console.log("Metadata updated with placeholders.");
}

module.exports = {
  collectFilePaths,
  updateDescriptions
};