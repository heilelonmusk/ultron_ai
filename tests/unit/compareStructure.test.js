/**
 * @file compareStructure.test.js
 * @description Unit tests for the compareStructure module.
 * All tests are written in English for consistency.
 */

import { expect } from 'chai';
import fs from 'fs';
import path from 'path';
import os from 'os';
import {
  generateStructureJson,
  loadDesiredStructure,
  compareStructures,
  checkStructureDifferences,
  saveStructure
} from '../../src/utils/compareStructure.js';

describe('compareStructure Module', function () {
  // Create a temporary directory for the tests
  const tempDir = path.join(os.tmpdir(), 'test-structure');
  const configFile = path.join(tempDir, 'structure.config.json');
  const backupFile = path.join(tempDir, 'backup_structure.json');

  // Example structure for the tests
  const testStructure = {
    folder1: {
      'file1.txt': null,
      'file2.txt': null
    },
    folder2: {
      subfolder1: {
        'file3.txt': null
      }
    },
    'file4.txt': null
  };

  // Helper to create the test directory structure on disk
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
    fs.writeFileSync(configFile, JSON.stringify(testStructure, null, 2), 'utf8');
  });

  after(function () {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  describe('generateStructureJson', function () {
    it('should generate a structure JSON object matching the test structure', function () {
      const generated = generateStructureJson(tempDir, []);
      expect(generated).to.deep.include({
        folder1: { 'file1.txt': null, 'file2.txt': null },
        folder2: { subfolder1: { 'file3.txt': null } },
        'file4.txt': null
      });
    });
  });

  describe('loadDesiredStructure', function () {
    it('should load the desired structure from the config file', function () {
      const desired = loadDesiredStructure(configFile);
      expect(desired).to.deep.equal(testStructure);
    });
  });

  describe('compareStructures', function () {
    it('should detect no differences when structures are identical', function () {
      const diff = compareStructures(testStructure, testStructure);
      expect(diff.missing).to.deep.equal({});
      expect(diff.extra).to.deep.equal({});
    });

    it('should detect missing and extra items correctly', function () {
      const modifiedStructure = {
        folder1: { 'file1.txt': null }, // missing file2.txt
        folder2: { subfolder1: { 'file3.txt': null } },
        'file4.txt': null,
        'fileExtra.txt': null
      };
      const diff = compareStructures(testStructure, modifiedStructure);
      expect(diff.missing.folder1).to.have.property('file2.txt');
      expect(diff.extra).to.have.property('fileExtra.txt');
    });
  });

  describe('checkStructureDifferences', function () {
    it('should print differences between desired and current structure if there are any', function () {
      const modifiedDesired = JSON.parse(JSON.stringify(testStructure));
      delete modifiedDesired.folder1['file2.txt'];
      fs.writeFileSync(configFile, JSON.stringify(modifiedDesired, null, 2), 'utf8');

      let output = '';
      const originalLog = console.log;
      console.log = msg => { output += msg + '\n'; };

      const diff = checkStructureDifferences(tempDir, configFile, []);
      console.log = originalLog;

      const missingKeys = Object.keys(diff.missing);
      const extraKeys = Object.keys(diff.extra);
      expect(missingKeys.length > 0 || extraKeys.length > 0).to.be.true;
    });
  });

  describe('saveStructure', function () {
    it('should save the current structure to a backup file', function () {
      saveStructure(tempDir, backupFile, []);
      const savedData = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
      expect(savedData).to.be.an('object');
      expect(savedData).to.deep.include({
        folder1: { 'file1.txt': null, 'file2.txt': null },
        folder2: { subfolder1: { 'file3.txt': null } },
        'file4.txt': null
      });
    });
  });
});