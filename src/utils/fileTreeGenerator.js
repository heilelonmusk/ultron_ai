// src/utils/fileTreeGenerator.js
const fs = require('fs');
const path = require('path');

/**
 * Loads metadata descriptions from a JSON file.
 * @param {string} metaPath - The path to the metadata file.
 * @returns {object} The metadata object.
 */
function loadMetadata(metaPath) {
  if (fs.existsSync(metaPath)) {
    const rawData = fs.readFileSync(metaPath, 'utf8');
    try {
      return JSON.parse(rawData);
    } catch (error) {
      console.error('Error parsing metadata file:', error);
      return {};
    }
  } else {
    return {};
  }
}

/**
 * Retrieves the description for a given key from the metadata.
 * Supports nested keys separated by '/'.
 * @param {object} metadata - The metadata object.
 * @param {string} keyPath - The path key (e.g., "src/utils").
 * @returns {string} The description if available, otherwise an empty string.
 */
function getDescription(metadata, keyPath) {
  const keys = keyPath.split('/');
  let current = metadata;
  for (let key of keys) {
    const lowerKey = key.toLowerCase();
    const foundKey = Object.keys(current).find(k => k.toLowerCase() === lowerKey);
    if (foundKey) {
      current = current[foundKey];
    } else {
      return '';
    }
  }
  return typeof current === 'string' ? current : '';
}

/**
 * Recursively generates a tree representation of the directory structure.
 *
 * @param {string} dirPath - The directory to generate the tree from.
 * @param {object} options - Options for generation.
 * @param {string[]} [options.compressDirs=[]] - Array of directory names to compress (case-insensitive).
 * @param {string} [options.indent=''] - The current indentation string.
 * @param {object} [metadata={}] - Metadata object for descriptions.
 * @param {string} [currentKey=''] - The current key path for metadata lookup.
 * @returns {string} The generated file tree as a string.
 */
function generateFileTree(dirPath, options = {}, metadata = {}, currentKey = '') {
  const { compressDirs = [], indent = '' } = options;
  let tree = '';
  let items;
  try {
    items = fs.readdirSync(dirPath);
  } catch (error) {
    return `${indent}[Error reading directory]\n`;
  }
  
  // Sort items alphabetically (case-insensitive)
  items.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
  
  items.forEach((item, index) => {
    const fullPath = path.join(dirPath, item);
    const isLast = index === items.length - 1;
    const prefix = isLast ? '└── ' : '├── ';
    let stats;
    try {
      stats = fs.statSync(fullPath);
    } catch (error) {
      stats = null;
    }
    // Build the metadata key for this item.
    const newKey = currentKey ? `${currentKey}/${item}` : item;
    
    if (stats && stats.isDirectory()) {
      // Check if this directory should be compressed (case-insensitive)
      if (compressDirs.map(dir => dir.toLowerCase()).includes(item.toLowerCase())) {
        let count = 0;
        try {
          count = fs.readdirSync(fullPath).length;
        } catch (e) {
          count = 'unknown';
        }
        const desc = getDescription(metadata, newKey);
        tree += `${indent}${prefix}${item} [${count} items]${desc ? ' - ' + desc : ''}\n`;
      } else {
        const desc = getDescription(metadata, newKey);
        tree += `${indent}${prefix}${item}${desc ? ' - ' + desc : ''}\n`;
        const newIndent = indent + (isLast ? '    ' : '│   ');
        tree += generateFileTree(fullPath, options, metadata, newKey);
        // Aggiungi una linea orizzontale al termine del blocco della directory, se ci sono figli.
        if (items.length > 0) {
          tree += `${indent}----------------\n`;
        }
      }
    } else {
      const desc = getDescription(metadata, newKey);
      tree += `${indent}${prefix}${item}${desc ? ' - ' + desc : ''}\n`;
    }
  });
  return tree;
}

/**
 * Writes the generated file tree to a specified output file.
 *
 * @param {string} baseDir - The base directory to generate the tree from.
 * @param {string} outputFile - The output file path where the tree will be written.
 * @param {object} [options={}] - Options for generation (e.g., { compressDirs: ["node_modules", ".git"] }).
 * @param {string} [metaPath='./description.json'] - Path to the metadata file.
 */
function writeFileTree(baseDir, outputFile, options = {}, metaPath = './description.json') {
  const metadata = loadMetadata(metaPath);
  const tree = generateFileTree(baseDir, options, metadata);
  fs.writeFileSync(outputFile, tree, 'utf8');
  console.log(`File tree generated at: ${outputFile}`);
}

module.exports = {
  generateFileTree,
  writeFileTree,
  loadMetadata,
  getDescription
};