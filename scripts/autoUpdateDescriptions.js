const path = require('path');
const { collectFilePaths, updateDescriptions } = require('./src/utils/updateDescriptions');

// Define base directory (repository root) and metadata file path
const baseDir = process.cwd();
const metadataPath = path.join(baseDir, 'descriptions.json');

// Collect all file paths, excluding directories like node_modules
const fileList = collectFilePaths(baseDir, ['node_modules']);

// Update the metadata file with placeholders for new files
updateDescriptions(metadataPath, fileList);