// fileManager.js
const fs = require('fs');
const path = require('path');

/**
 * Creates a directory if it does not exist.
 * @param {string} dirPath - The path of the directory to create.
 */
function createDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Directory created: ${dirPath}`);
  }
}

/**
 * Creates a file with the given content if it does not exist.
 * @param {string} filePath - The path of the file to create.
 * @param {string} [content='// Placeholder'] - The content to write in the file.
 */
function createFile(filePath, content = '// Placeholder') {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`File created: ${filePath}`);
  }
}

/**
 * Updates a file with the given content.
 * @param {string} filePath - The path of the file to update.
 * @param {string} content - The new content for the file.
 * @param {object} [options={ flag: 'w' }] - Write options (e.g., flag: 'a' for append).
 */
function updateFile(filePath, content, options = { flag: 'w' }) {
  fs.writeFileSync(filePath, content, options);
  console.log(`File updated: ${filePath}`);
}

/**
 * Renames a file from oldPath to newPath.
 * @param {string} oldPath - The current path of the file.
 * @param {string} newPath - The new desired path (or name) for the file.
 */
function renameFile(oldPath, newPath) {
  if (fs.existsSync(oldPath)) {
    fs.renameSync(oldPath, newPath);
    console.log(`File renamed from ${oldPath} to ${newPath}`);
  } else {
    console.error(`Cannot rename: ${oldPath} does not exist.`);
  }
}

module.exports = {
  createDirectory,
  createFile,
  updateFile,
  renameFile,
};