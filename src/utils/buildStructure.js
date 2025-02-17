// buildStructure.js
const fs = require('fs');
const path = require('path');
const { createDirectory, createFile } = require('./fileManager');

/**
 * Loads the structure configuration from 'structure.config.json'.
 * @returns {object} The parsed structure configuration object.
 * @throws Will exit the process if the configuration file is not found or cannot be parsed.
 */
function loadStructureConfig() {
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
 * @param {string} basePath - The base path where the structure should be created.
 * @param {object|Array} structure - The structure configuration object or array of file names.
 */
function createStructure(basePath, structure) {
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
function buildRepositoryStructure() {
  const baseDir = process.cwd(); // The current directory as repository root
  console.log('Loading structure configuration from structure.config.json...');
  const structure = loadStructureConfig();
  console.log('Creating repository structure...');
  createStructure(baseDir, structure);
  console.log('Structure successfully created!');
}

buildRepositoryStructure();