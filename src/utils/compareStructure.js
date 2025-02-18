// src/utils/compareStructure.js
import fs from 'fs';
import path from 'path';

/**
 * Recursively scans a directory and returns an object representing its structure.
 * Directories become nested objects; files are represented as null.
 */
export function generateStructureJson(dirPath, excludeDirs = []) {
  const structure = {};
  let items;
  try {
    items = fs.readdirSync(dirPath);
  } catch (err) {
    console.error(`Error reading directory ${dirPath}:`, err);
    return structure;
  }
  
  items.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
  
  items.forEach(item => {
    if (excludeDirs.map(d => d.toLowerCase()).includes(item.toLowerCase())) {
      return;
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
 */
export function loadDesiredStructure(configPath) {
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
 * Recursively compares two structure objects and returns differences.
 */
export function compareStructures(desired, current) {
  const diff = { missing: {}, extra: {} };

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
 * Compares the desired structure (from config) with the current structure
 * and prints the differences.
 */
export function checkStructureDifferences(baseDir, configPath, excludeDirs = []) {
  const desiredStructure = loadDesiredStructure(configPath);
  const currentStructure = generateStructureJson(baseDir, excludeDirs);
  const diff = compareStructures(desiredStructure, currentStructure);
  console.log('Differences between desired and current structure:');
  console.log(JSON.stringify(diff, null, 2));
  return diff;
}

/**
 * Saves the current structure of a directory to a JSON file.
 */
export function saveStructure(dirPath, outputFile, excludeDirs = []) {
  const currentStructure = generateStructureJson(dirPath, excludeDirs);
  fs.writeFileSync(outputFile, JSON.stringify(currentStructure, null, 2), 'utf8');
  console.log(`Structure saved to: ${outputFile}`);
}