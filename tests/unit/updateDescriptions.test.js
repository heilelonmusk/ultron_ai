// tests/unit/updateDescriptions.test.js
import { expect } from 'chai';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { collectFilePaths, updateDescriptions } from '../../src/utils/updateDescriptions.js';

describe('updateDescriptions Module', function () {
  let tempDir, metadataFile;
  const testStructure = {
    folderX: {
      'fileX1.txt': null,
      'fileX2.txt': null
    },
    folderY: {
      subfolderY1: {
        'fileY1.txt': null
      }
    },
    'fileZ.txt': null
  };

  function createTestStructure(base, structure) {
    Object.keys(structure).forEach(key => {
      const curPath = path.join(base, key);
      if (structure[key] === null) {
        fs.writeFileSync(curPath, 'Test', 'utf8');
      } else {
        fs.mkdirSync(curPath, { recursive: true });
        createTestStructure(curPath, structure[key]);
      }
    });
  }

  before(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ud-test-'));
    metadataFile = path.join(tempDir, 'description.json');
    createTestStructure(tempDir, testStructure);
    // Create an initial empty metadata file.
    fs.writeFileSync(metadataFile, JSON.stringify({}, null, 2), 'utf8');
  });

  after(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  describe('collectFilePaths', function () {
    it('should collect all file paths from the directory', function () {
      const filePaths = collectFilePaths(tempDir, []);
      expect(filePaths).to.include.members([
        path.join('folderX', 'fileX1.txt'),
        path.join('folderX', 'fileX2.txt'),
        path.join('folderY', 'subfolderY1', 'fileY1.txt'),
        'fileZ.txt'
      ]);
    });
  });

  describe('updateDescriptions', function () {
    it('should update metadata file with placeholders for all files', function () {
      const filePaths = collectFilePaths(tempDir, []);
      updateDescriptions(metadataFile, filePaths, 'No description available');
      const metadata = JSON.parse(fs.readFileSync(metadataFile, 'utf8'));
      expect(metadata).to.have.property('folderX');
      expect(metadata.folderX).to.have.property('fileX1.txt', 'No description available');
    });
  });
});