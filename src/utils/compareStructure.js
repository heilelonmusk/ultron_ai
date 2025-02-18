// src/utils/compareStructure.js
const fs = require('fs');
const path = require('path');

/**
 * Recursively scans a directory and returns an object representing its structure.
 * Directories become nested objects; files are represented as null.
 * @param {string} dirPath - The directory path to scan.
 * @param {string[]} [excludeDirs=[]] - List of directory names to exclude.
 * @returns {object} The structure object.
 */
function generateStructureJson(dirPath, excludeDirs = []) {
  const structure = {};
  let items;
  try {
    items = fs.readdirSync(dirPath);
  } catch (err) {
    console.error(`Error reading directory ${dirPath}:`, err);
    return structure;
  }
  
  // Sort items alphabetically (case-insensitive)
  items.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
  
  items.forEach(item => {
    if (excludeDirs.map(d => d.toLowerCase()).includes(item.toLowerCase())) {
      return; // Skip excluded directories
    }
    const fullPath = path.join(dirPath, item);
    let stats;
    try {
      stats = fs.statSync(fullPath);
    } catch (err) {
      console.error(`Error stating ${fullPath}:`, err);
      return;
    }
    if (stats.isDirectory()) {
      structure[item] = generateStructureJson(fullPath, excludeDirs);
    } else {
      structure[item] = null;
    }
  });
  return structure;
}

/**
 * Reads the desired structure from structure.config.json.
 * @param {string} configPath - Path to the structure.config.json file.
 * @returns {object} The desired structure object.
 */
function loadDesiredStructure(configPath) {
  if (fs.existsSync(configPath)) {
    const rawData = fs.readFileSync(configPath, 'utf8');
    try {
      return JSON.parse(rawData);
    } catch (error) {
      console.error('Error parsing structure.config.json:', error);
      return {};
    }
  } else {
    console.error('structure.config.json not found.');
    return {};
  }
}

/**
 * Recursively compares two structure objects and returns the differences.
 * The differences are returned in an object containing:
 * - missing: elements present in the desired structure but missing in the current one.
 * - extra: elements present in the current structure but not in the desired one.
 * @param {object} desired - The desired structure.
 * @param {object} current - The current structure.
 * @returns {object} An object with "missing" and "extra" differences.
 */
function compareStructures(desired, current) {
  const diff = { missing: {}, extra: {} };

  // Check for missing items in the current structure
  for (const key in desired) {
    if (!(key in current)) {
      diff.missing[key] = desired[key];
    } else if (desired[key] && typeof desired[key] === 'object') {
      const childDiff = compareStructures(desired[key], current[key] || {});
      if (Object.keys(childDiff.missing).length > 0) {
        diff.missing[key] = childDiff.missing;
      }
      if (Object.keys(childDiff.extra).length > 0) {
        diff.extra[key] = childDiff.extra;
      }
    }
  }

  // Check for extra items in the current structure
  for (const key in current) {
    if (!(key in desired)) {
      diff.extra[key] = current[key];
    } else if (current[key] && typeof current[key] === 'object') {
      const childDiff = compareStructures(desired[key] || {}, current[key]);
      if (Object.keys(childDiff.extra).length > 0) {
        diff.extra[key] = childDiff.extra;
      }
    }
  }

  return diff;
}

/**
 * Compares the desired structure (from config) with the current structure (scanned from disk)
 * and prints the differences.
 * @param {string} baseDir - The base directory to scan.
 * @param {string} configPath - The path to structure.config.json.
 * @param {string[]} [excludeDirs=[]] - Array of directory names to exclude from scanning.
 */
function checkStructureDifferences(baseDir, configPath, excludeDirs = []) {
  const desiredStructure = loadDesiredStructure(configPath);
  const currentStructure = generateStructureJson(baseDir, excludeDirs);
  const diff = compareStructures(desiredStructure, currentStructure);
  console.log('Differences between desired and current structure:');
  console.log(JSON.stringify(diff, null, 2));
  return diff;
}

/**
 * Saves the current structure of a directory to a JSON file.
 * @param {string} dirPath - The directory to scan.
 * @param {string} outputFile - The file where the structure will be saved.
 * @param {string[]} [excludeDirs=[]] - Array of directory names to exclude from scanning.
 */
function saveStructure(dirPath, outputFile, excludeDirs = []) {
  const currentStructure = generateStructureJson(dirPath, excludeDirs);
  fs.writeFileSync(outputFile, JSON.stringify(currentStructure, null, 2), 'utf8');
  console.log(`Structure saved to: ${outputFile}`);
}

module.exports = {
  generateStructureJson,
  loadDesiredStructure,
  compareStructures,
  checkStructureDifferences,
  saveStructure
};