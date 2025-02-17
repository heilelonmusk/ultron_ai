/**
 * @file fileManager.test.js
 * @description Unit tests for the fileManager module.
 * All functions and annotations are in English to maintain consistency.
 */

const { expect } = require('chai');
const fs = require('fs');
const path = require('path');
const { createDirectory, createFile, updateFile, renameFile } = require('../../fileManager');

describe('fileManager Module', () => {
  const testDir = path.join(__dirname, 'tempTestDir');
  const testFile = path.join(testDir, 'test.txt');

  before(() => {
    // Remove any previous test directory if it exists
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  after(() => {
    // Clean up the test directory after tests complete
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  it('should create a directory if it does not exist', () => {
    createDirectory(testDir);
    expect(fs.existsSync(testDir)).to.be.true;
  });

  it('should create a file with default content', () => {
    createFile(testFile);
    expect(fs.existsSync(testFile)).to.be.true;
    const content = fs.readFileSync(testFile, 'utf8');
    expect(content).to.include('Placeholder');
  });

  it('should update the file with new content', () => {
    const newContent = 'New content';
    updateFile(testFile, newContent);
    const content = fs.readFileSync(testFile, 'utf8');
    expect(content).to.equal(newContent);
  });

  it('should rename the file', () => {
    const newFileName = path.join(testDir, 'renamed.txt');
    renameFile(testFile, newFileName);
    expect(fs.existsSync(newFileName)).to.be.true;
    expect(fs.existsSync(testFile)).to.be.false;
  });
});