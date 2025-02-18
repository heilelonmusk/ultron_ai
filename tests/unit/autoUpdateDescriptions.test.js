/**
 * @file autoUpdateDescriptions.test.js
 * @description Unit tests for the updateDescriptions module.
 * The tests simulate a file structure and verify that the metadata file is updated with placeholders.
 */

const { expect } = require('chai');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { collectFilePaths, updateDescriptions } = require('../../src/utils/updateDescriptions');

describe('updateDescriptions Module', function () {
  const tempDir = path.join(os.tmpdir(), 'autoUpdateDescriptionsTest');
  const metadataFile = path.join(tempDir, 'test_descriptions.json');

  // Struttura di test fittizia
  const testStructure = {
    "folderX": {
      "fileX1.txt": null,
      "fileX2.txt": null
    },
    "folderY": {
      "subfolderY1": {
        "fileY1.txt": null
      }
    },
    "fileZ.txt": null
  };

  // Helper per creare la struttura fittizia sul disco
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
    // Crea la struttura fittizia
    createTestStructure(tempDir, testStructure);
    // Inizialmente, il file di metadati è vuoto
    fs.writeFileSync(metadataFile, JSON.stringify({}, null, 2), 'utf8');
  });

  after(function () {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('should collect all file paths from the test structure', function () {
    const filePaths = collectFilePaths(tempDir, []);
    // Dovremmo trovare fileX1.txt, fileX2.txt, fileY1.txt e fileZ.txt
    expect(filePaths).to.include.members([
      path.join('folderX', 'fileX1.txt'),
      path.join('folderX', 'fileX2.txt'),
      path.join('folderY', 'subfolderY1', 'fileY1.txt'),
      'fileZ.txt'
    ]);
  });

  it('should update metadata file with placeholders for new files', function () {
    // Aggiorna il file di metadati con i placeholder ("No description available" di default)
    updateDescriptions(metadataFile, collectFilePaths(tempDir, []), "No description available");

    // Legge il file di metadati aggiornato
    const metadata = JSON.parse(fs.readFileSync(metadataFile, 'utf8'));
    
    // Controlla che per ogni file della struttura vi sia una voce nel metadata con il placeholder
    // Ad esempio, per folderX/fileX1.txt
    expect(metadata).to.have.property('folderX');
    expect(metadata.folderX).to.have.property('fileX1.txt');
    expect(metadata.folderX['fileX1.txt']).to.equal("No description available");

    // Puoi aggiungere altri controlli per le altre voci...
  });
});