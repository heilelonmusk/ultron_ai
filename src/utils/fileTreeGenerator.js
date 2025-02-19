// src/utils/fileTreeGenerator.js
import fs from 'fs';
import path from 'path';

/**
 * Loads metadata descriptions from a JSON file.
 * @param {string} metaPath - The path to the metadata JSON file.
 * @returns {object} The parsed metadata object or an empty object if the file doesn’t exist or fails to parse.
 */
export function loadMetadata(metaPath) {
  if (fs.existsSync(metaPath)) {
    const rawData = fs.readFileSync(metaPath, 'utf8');
    try {
      return JSON.parse(rawData);
    } catch (error) {
      console.error('Error parsing metadata file:', error);
      return {};
    }
  } else {
    console.warn(`Metadata file not found at ${metaPath}`);
    return {};
  }
}

/**
 * Retrieves the description for a given key from the metadata.
 * Traverses the metadata object using keys split by '/'.
 * @param {object} metadata - The metadata object.
 * @param {string} keyPath - The key path (e.g. "src/utils/fileManager.js").
 * @returns {string} The description if found; otherwise, returns an empty string.
 */
export function getDescription(metadata, keyPath) {
  const keys = keyPath.split('/');
  let current = metadata;
  for (let key of keys) {
    if (current && typeof current === 'object') {
      const lowerKey = key.toLowerCase();
      const foundKey = Object.keys(current).find(k => k.toLowerCase() === lowerKey);
      if (foundKey) {
        current = current[foundKey];
      } else {
        return '';
      }
    } else {
      return '';
    }
  }
  return typeof current === 'string' ? current : '';
}

/**
 * Recursively generates a tree representation of the directory structure.
 * Incorporates metadata descriptions when available.
 * @param {string} dirPath - The directory to scan.
 * @param {object} [options={}] - Options for tree generation (e.g., { compressDirs: ['node_modules', '.git'] }).
 * @param {string} [indent=''] - The current indentation string for recursion.
 * @param {object} [metadata={}] - Metadata object used for retrieving descriptions.
 * @param {string} [currentKey=''] - The accumulated key path used for metadata lookup.
 * @returns {string} A string representing the directory tree.
 */
export function generateFileTree(
  dirPath,
  options = {},
  indent = '',
  metadata = {},
  currentKey = ''
) {
  const { compressDirs = [] } = options;
  let tree = '';
  let items;
  try {
    items = fs.readdirSync(dirPath);
  } catch (error) {
    return `${indent}[Error reading directory]\n`;
  }
  
  // Sort items alphabetically (case-insensitive)
  items.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
  
  // Separate directories and files
  const directories = items.filter(item => {
    try {
      return fs.statSync(path.join(dirPath, item)).isDirectory();
    } catch {
      return false;
    }
  });
  const files = items.filter(item => {
    try {
      return !fs.statSync(path.join(dirPath, item)).isDirectory();
    } catch {
      return false;
    }
  });
  const sortedItems = directories.concat(files);
  
  // Process each item
  sortedItems.forEach((item, index) => {
    const fullPath = path.join(dirPath, item);
    const isLast = index === sortedItems.length - 1;
    const prefix = isLast ? '└── ' : '├── ';
    let stats;
    try {
      stats = fs.statSync(fullPath);
    } catch {
      stats = null;
    }
    // Build a new key for metadata lookup
    const newKey = currentKey ? `${currentKey}/${item}` : item;
    
    if (stats && stats.isDirectory()) {
      if (compressDirs.map(dir => dir.toLowerCase()).includes(item.toLowerCase())) {
        // If the directory should be compressed, show the count of its items.
        let count = 0;
        try {
          count = fs.readdirSync(fullPath).length;
        } catch {
          count = 'unknown';
        }
        const desc = getDescription(metadata, newKey);
        tree += `${indent}${prefix}${item} [${count} items]${desc ? ' - ' + desc : ''}\n`;
      } else {
        const desc = getDescription(metadata, newKey);
        tree += `${indent}${prefix}${item}${desc ? ' - ' + desc : ''}\n`;
        const newIndent = indent + (isLast ? '    ' : '│   ');
        tree += generateFileTree(fullPath, options, newIndent, metadata, newKey);
      }
    } else {
      const desc = getDescription(metadata, newKey);
      tree += `${indent}${prefix}${item}${desc ? ' - ' + desc : ''}\n`;
    }
    
    // Add an extra newline between top-level items
    if (indent === '' && !isLast) {
      tree += '\n';
    }
  });
  return tree;
}

/**
 * Writes the generated file tree to an output file.
 * @param {string} baseDir - The base directory from which to generate the tree.
 * @param {string} outputFile - The path of the output file (e.g., "file_tree.txt").
 * @param {object} [options={}] - Options for tree generation.
 * @param {string} [metaPath='./description.json'] - The path to the metadata JSON file.
 */
export function writeFileTree(
  baseDir,
  outputFile,
  options = {},
  metaPath = './description.json'
) {
  const metadata = loadMetadata(metaPath);
  const tree = generateFileTree(baseDir, options, '', metadata);
  fs.writeFileSync(outputFile, tree, 'utf8');
  console.log(`File tree generated at: ${outputFile}`);
}