// src/utils/fileTreeGenerator.js
import fs from 'fs';
import path from 'path';

/**
 * Loads metadata descriptions from a JSON file.
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
    return {};
  }
}

/**
 * Retrieves the description for a given key from the metadata.
 */
export function getDescription(metadata, keyPath) {
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
  
  items.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
  
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
    const newKey = currentKey ? `${currentKey}/${item}` : item;
    
    if (stats && stats.isDirectory()) {
      if (compressDirs.map(dir => dir.toLowerCase()).includes(item.toLowerCase())) {
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
    
    if (indent === '' && !isLast) {
      tree += '\n';
    }
  });
  return tree;
}

/**
 * Writes the generated file tree to an output file.
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