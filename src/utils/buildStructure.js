// src/utils/buildStructure.js
import fs from 'fs';
import path from 'path';
import { createDirectory, createFile } from './fileManager.js';

/**
 * Loads the structure configuration from 'structure.config.json'.
 */
export function loadStructureConfig() {
  const configPath = path.join(process.cwd(), 'structure.config.json');
  if (!fs.existsSync(configPath)) {
    console.error('structure.config.json not found. Please create it to define the structure.');
    process.exit(1);
  }
  try {
    const configData = fs.readFileSync(configPath, 'utf8');
    return JSON.parse(configData);
  } catch (err) {
    console.error('Error parsing structure.config.json:', err.message);
    process.exit(1);
  }
}

/**
 * Recursively creates directories and files based on the provided structure configuration.
 */
export function createStructure(basePath, structure) {
  if (Array.isArray(structure)) {
    structure.forEach(file => {
      const filePath = path.join(basePath, file);
      createFile(filePath, `// Placeholder for ${file}\n`);
    });
  } else if (typeof structure === 'object') {
    Object.keys(structure).forEach(key => {
      const currentPath = path.join(basePath, key);
      createDirectory(currentPath);
      createStructure(currentPath, structure[key]);
    });
  }
}

/**
 * Builds the repository structure based on the configuration defined in structure.config.json.
 */
export function buildRepositoryStructure() {
  const baseDir = process.cwd();
  console.log('Loading structure configuration from structure.config.json...');
  const structure = loadStructureConfig();
  console.log('Creating repository structure...');
  createStructure(baseDir, structure);
  console.log('Structure successfully created!');
}

// If you want it to run as a CLI:
if (import.meta.url === process.argv[1] || import.meta.url === new URL(process.argv[1], 'file://').href) {
  buildRepositoryStructure();
}