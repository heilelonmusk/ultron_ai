// src/utils/fileManager.js
import fs from 'fs';
import path from 'path';

/**
 * Creates a directory if it does not exist.
 */
export function createDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Directory created: ${dirPath}`);
  }
}

/**
 * Creates a file with given content if it does not exist.
 */
export function createFile(filePath, content = '// Placeholder') {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`File created: ${filePath}`);
  }
}

/**
 * Updates a file with new content.
 */
export function updateFile(filePath, content, options = { flag: 'w' }) {
  fs.writeFileSync(filePath, content, options);
  console.log(`File updated: ${filePath}`);
}

/**
 * Renames a file from oldPath to newPath.
 */
export function renameFile(oldPath, newPath) {
  if (fs.existsSync(oldPath)) {
    fs.renameSync(oldPath, newPath);
    console.log(`File renamed from ${oldPath} to ${newPath}`);
  } else {
    console.error(`Cannot rename: ${oldPath} does not exist.`);
  }
}

/**
 * Copies a file from source to destination.
 */
export function copyFile(source, destination) {
  if (fs.existsSync(source)) {
    fs.copyFileSync(source, destination);
    console.log(`File copied from ${source} to ${destination}`);
  } else {
    console.error(`Cannot copy: ${source} does not exist.`);
  }
}

/**
 * Moves a file from source to destination.
 */
export function moveFile(source, destination) {
  if (fs.existsSync(source)) {
    fs.renameSync(source, destination);
    console.log(`File moved from ${source} to ${destination}`);
  } else {
    console.error(`Cannot move: ${source} does not exist.`);
  }
}