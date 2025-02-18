/**
 * @file compareStructure.test.js
 * @description Unit tests for the compareStructure module.
 * All tests are written in English for consistency.
 */

const { expect } = require('chai');
const fs = require('fs');
const path = require('path');
const os = require('os');
const {
  generateStructureJson,
  loadDesiredStructure,
  compareStructures,
  checkStructureDifferences,
  saveStructure
} = require('../../src/utils/compareStructure');

describe('compareStructure Module', function () {
  // Creiamo una directory temporanea per i test
  const tempDir = path.join(os.tmpdir(), 'test-structure');
  const configFile = path.join(tempDir, 'structure.config.json');
  const backupFile = path.join(tempDir, 'backup_structure.json');

  // Struttura fittizia per i test
  const testStructure = {
    "folder1": {
      "file1.txt": null,
      "file2.txt": null
    },
    "folder2": {
      "subfolder1": {
        "file3.txt": null
      }
    },
    "file4.txt": null
  };

  // Helper per creare la struttura di test su disco
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
    // Assicuriamoci di avere una directory temporanea
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }
    // Crea la struttura di test
    createTestStructure(tempDir, testStructure);
    // Salva la struttura desiderata nel file config (questo file rappresenta il "file origine")
    fs.writeFileSync(configFile, JSON.stringify(testStructure, null, 2), 'utf8');
  });

  after(function () {
    // Pulisci la directory temporanea
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  describe('generateStructureJson', function () {
    it('should generate a structure JSON object matching the test structure', function () {
      const generated = generateStructureJson(tempDir, []);
      // Per il confronto, usiamo deep.include per verificare che le parti rilevanti siano presenti
      expect(generated).to.deep.include({
        "folder1": { "file1.txt": null, "file2.txt": null },
        "folder2": { "subfolder1": { "file3.txt": null } },
        "file4.txt": null
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
        "folder1": { "file1.txt": null }, // file2.txt is missing
        "folder2": { "subfolder1": { "file3.txt": null } },
        "file4.txt": null,
        "fileExtra.txt": null // extra item
      };
      const diff = compareStructures(testStructure, modifiedStructure);
      // In testStructure, in folder1 manca file2.txt
      expect(diff.missing).to.have.property('folder1');
      expect(diff.missing.folder1).to.have.property('file2.txt');
      // In modifiedStructure, fileExtra.txt è in eccesso
      expect(diff.extra).to.have.property('fileExtra.txt');
    });
  });

  describe('checkStructureDifferences', function () {
    it('should print differences between desired and current structure and fail if differences exist', function () {
      // Per questo test, modifichiamo temporaneamente la struttura desiderata per simulare una discrepanza
      const modifiedDesired = JSON.parse(JSON.stringify(testStructure));
      // Rimuoviamo "file2.txt" da folder1 per simulare una mancanza
      delete modifiedDesired.folder1["file2.txt"];
      fs.writeFileSync(configFile, JSON.stringify(modifiedDesired, null, 2), 'utf8');

      // Catturiamo l'output di console.log
      let output = '';
      const originalLog = console.log;
      console.log = (msg) => { output += msg + '\n'; };

      const diff = checkStructureDifferences(tempDir, configFile, []);
      
      console.log = originalLog;
      
      // Se ci sono discrepanze, diff dovrebbe avere proprietà in missing o extra.
      const missingKeys = Object.keys(diff.missing);
      const extraKeys = Object.keys(diff.extra);
      if (missingKeys.length > 0 || extraKeys.length > 0) {
        console.log('Differences found:\n', JSON.stringify(diff, null, 2));
      }
      // Asseriamo che ci siano discrepanze, così il test fallirà se non ce ne sono.
      expect(missingKeys.length > 0 || extraKeys.length > 0).to.be.true;
    });
  });

  describe('saveStructure', function () {
    it('should save the current structure to a backup file', function () {
      saveStructure(tempDir, backupFile, []);
      const savedData = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
      expect(savedData).to.be.an('object');
      expect(savedData).to.deep.include({
        "folder1": { "file1.txt": null, "file2.txt": null },
        "folder2": { "subfolder1": { "file3.txt": null } },
        "file4.txt": null
      });
    });
  });
});