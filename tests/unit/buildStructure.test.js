// tests/unit/buildStructure.test.js
import { expect } from 'chai';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

// Use top-level await to import the functions dynamically to avoid cyclic dependency issues.
const { loadStructureConfig, createStructure, buildRepositoryStructure } = await import('../../src/utils/buildStructure.js');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to create a test directory structure on disk.
function createTestStructureOnDisk(basePath, structure) {
  Object.keys(structure).forEach(key => {
    const currentPath = path.join(basePath, key);
    if (structure[key] === null) {
      fs.writeFileSync(currentPath, `Content of ${key}`, 'utf8');
    } else {
      fs.mkdirSync(currentPath, { recursive: true });
      createTestStructureOnDisk(currentPath, structure[key]);
    }
  });
}

describe('buildStructure Module', function () {
  let tempDir, configFile;
  // Define an example structure for testing.
  const sampleStructure = {
    "folderA": {
      "fileA.txt": null,
      "folderB": ["fileB1.txt", "fileB2.txt"]
    },
    "fileRoot.txt": null
  };

  beforeEach(() => {
    // Create a temporary directory for the tests.
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bs-test-'));
    // Write the sampleStructure into a temporary structure.config.json.
    configFile = path.join(tempDir, 'structure.config.json');
    fs.writeFileSync(configFile, JSON.stringify(sampleStructure, null, 2), 'utf8');
  });

  afterEach(() => {
    // Clean up the temporary directory.
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  describe('loadStructureConfig', function () {
    it('should load and parse the structure configuration from the file', function () {
      // Temporarily change working directory to tempDir.
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      const config = loadStructureConfig();
      expect(config).to.deep.equal(sampleStructure);

      process.chdir(originalCwd);
    });

    it('should log an error and exit if the config file is missing', function (done) {
      // Remove the config file.
      fs.unlinkSync(configFile);

      // Override process.exit to catch the exit call.
      const originalExit = process.exit;
      let exitCode = null;
      process.exit = (code) => {
        exitCode = code;
        process.exit = originalExit;
        done();
      };

      // Temporarily change working directory to tempDir.
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      // Calling loadStructureConfig should trigger process.exit.
      loadStructureConfig();

      process.chdir(originalCwd);
      expect(exitCode).to.not.equal(null);
    });
  });

  describe('createStructure', function () {
    it('should create directories and files based on the provided structure configuration', function () {
      // Create a new directory inside tempDir for building the structure.
      const buildDir = path.join(tempDir, 'build');
      fs.mkdirSync(buildDir);

      createStructure(buildDir, sampleStructure);

      // Verify that folderA and its contents were created.
      const folderAPath = path.join(buildDir, 'folderA');
      expect(fs.existsSync(folderAPath)).to.be.true;
      expect(fs.existsSync(path.join(folderAPath, 'fileA.txt'))).to.be.true;

      // Verify that folderB exists inside folderA and contains the correct files.
      const folderBPath = path.join(folderAPath, 'folderB');
      expect(fs.existsSync(folderBPath)).to.be.true;
      expect(fs.existsSync(path.join(folderBPath, 'fileB1.txt'))).to.be.true;
      expect(fs.existsSync(path.join(folderBPath, 'fileB2.txt'))).to.be.true;

      // Verify that fileRoot.txt exists in buildDir.
      expect(fs.existsSync(path.join(buildDir, 'fileRoot.txt'))).to.be.true;
    });
  });

  describe('buildRepositoryStructure', function () {
    it('should build the repository structure from the configuration file', function () {
      // Temporarily change working directory to tempDir.
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      // Call buildRepositoryStructure, which should read the config from the current directory.
      buildRepositoryStructure();

      // Verify that the structure was built as expected.
      const folderAPath = path.join(tempDir, 'folderA');
      const folderBPath = path.join(folderAPath, 'folderB');
      expect(fs.existsSync(folderAPath)).to.be.true;
      expect(fs.existsSync(path.join(folderAPath, 'fileA.txt'))).to.be.true;
      expect(fs.existsSync(folderBPath)).to.be.true;
      expect(fs.existsSync(path.join(folderBPath, 'fileB1.txt'))).to.be.true;
      expect(fs.existsSync(path.join(folderBPath, 'fileB2.txt'))).to.be.true;
      expect(fs.existsSync(path.join(tempDir, 'fileRoot.txt'))).to.be.true;

      process.chdir(originalCwd);
    });
  });
});