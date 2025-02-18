/**
 * @file fileTreeGenerator.test.js
 * @description Unit tests for the fileTreeGenerator module.
 * All tests are written in English for consistency.
 */

import { expect } from 'chai';
import fs from 'fs';
import path from 'path';
import os from 'os';
import {
  generateFileTree,
  writeFileTree,
  loadMetadata,
  getDescription
} from '../../src/utils/fileTreeGenerator.js';

describe('fileTreeGenerator Module', function () {
  const tempDir = path.join(os.tmpdir(), 'ftg-test-structure');
  const outputTreeFile = path.join(tempDir, 'file_tree.txt');
  const metadataFile = path.join(tempDir, 'description.json');

  const testStructure = {
    folderA: {
      'fileA1.txt': null,
      'fileA2.txt': null
    },
    folderB: {
      subfolderB1: {
        'fileB1.txt': null
      }
    },
    'fileRoot.txt': null
  };

  const testMetadata = {
    folderA: 'Contains files A1 and A2.',
    folderB: 'Contains subfolder B1 with file B1.',
    'fileRoot.txt': 'A file at the root.'
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
      fs.mkdirSync(tempDir);
    }
    createTestStructure(tempDir, testStructure);
    fs.writeFileSync(metadataFile, JSON.stringify(testMetadata, null, 2), 'utf8');
  });

  after(function () {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  describe('loadMetadata', function () {
    it('should load metadata from a JSON file', function () {
      const metadata = loadMetadata(metadataFile);
      expect(metadata).to.deep.equal(testMetadata);
    });
  });

  describe('getDescription', function () {
    it('should return the correct description for a given key', function () {
      const desc = getDescription(testMetadata, 'folderA');
      expect(desc).to.equal('Contains files A1 and A2.');
      const desc2 = getDescription(testMetadata, 'fileRoot.txt');
      expect(desc2).to.equal('A file at the root.');
      const descNonExistent = getDescription(testMetadata, 'nonexistent');
      expect(descNonExistent).to.equal('');
    });
  });

  describe('generateFileTree', function () {
    it('should generate a file tree string that includes all files and folders', function () {
      const tree = generateFileTree(tempDir, { compressDirs: [] }, '', '');
      expect(tree).to.include('folderA');
      expect(tree).to.include('fileA1.txt');
      expect(tree).to.include('folderB');
      expect(tree).to.include('subfolderB1');
      expect(tree).to.include('fileRoot.txt');
    });

    it('should compress directories specified in compressDirs', function () {
      const tree = generateFileTree(tempDir, { compressDirs: ['folderB'] }, '', '');
      expect(tree).to.match(/folderB \[\d+ items\]/);
      expect(tree).to.not.include('subfolderB1');
    });

    it('should integrate descriptions from metadata', function () {
      const tree = generateFileTree(tempDir, { compressDirs: [] }, '', testMetadata);
      expect(tree).to.include('folderA - Contains files A1 and A2.');
      expect(tree).to.include('fileRoot.txt - A file at the root.');
    });
  });

  describe('writeFileTree', function () {
    it('should write the generated file tree to an output file', function () {
      writeFileTree(tempDir, outputTreeFile, { compressDirs: ['folderB'] }, metadataFile);
      const outputContent = fs.readFileSync(outputTreeFile, 'utf8');
      expect(outputContent).to.include('folderA');
      expect(outputContent).to.include('folderB');
      expect(outputContent).to.include('fileRoot.txt');
    });
  });
});