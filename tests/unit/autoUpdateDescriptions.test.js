/**
 * @file autoUpdateDescriptions.test.js
 * @description Unit tests for the updateDescriptions module.
 * The tests simulate a file structure and verify that the metadata file is updated with placeholders.
 */

import { expect } from 'chai';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { collectFilePaths, updateDescriptions } from '../../src/utils/updateDescriptions.js';

describe('updateDescriptions Module', function () {
  const tempDir = path.join(os.tmpdir(), 'autoUpdateDescriptionsTest');
  const metadataFile = path.join(tempDir, 'test_descriptions.json');

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

  function createTestStructure(basePath, structure) {
    Object.keys(structure).forEach(key => {
      const currentPath = path.join(basePath, key);
      if (structure[key] === null) {
        fs.writeFileSync(currentPath, `Content of ${key}`, 'utf8');
      } else {
        fs.mkdirSync(currentPath, { recursive: true });
        createTestStructure(currentPath, structure[key]);
      }
    });
  }

  before(function () {
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    createTestStructure(tempDir, testStructure);
    fs.writeFileSync(metadataFile, JSON.stringify({}, null, 2), 'utf8');
  });

  after(function () {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('should collect all file paths from the test structure', function () {
    const filePaths = collectFilePaths(tempDir, []);
    expect(filePaths).to.include.members([
      path.join('folderX', 'fileX1.txt'),
      path.join('folderX', 'fileX2.txt'),
      path.join('folderY', 'subfolderY1', 'fileY1.txt'),
      'fileZ.txt'
    ]);
  });

  it('should update metadata file with placeholders for new files', function () {
    updateDescriptions(
      metadataFile,
      collectFilePaths(tempDir, []),
      'No description available'
    );

    const metadata = JSON.parse(fs.readFileSync(metadataFile, 'utf8'));
    expect(metadata).to.have.property('folderX');
    expect(metadata.folderX).to.have.property('fileX1.txt');
    expect(metadata.folderX['fileX1.txt']).to.equal('No description available');
  });
});