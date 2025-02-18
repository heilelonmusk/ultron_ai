/**
 * @file fileManager.test.js
 * @description Unit tests for the fileManager module.
 * All functions and annotations are in English to maintain consistency.
 */

const { expect } = require('chai');
const fs = require('fs');
const path = require('path');
const { 
  createDirectory, 
  createFile, 
  updateFile, 
  renameFile, 
  copyFile, 
  moveFile 
} = require('../../src/utils/fileManager');

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

  it('should copy a file', () => {
    // Create a source file and copy it.
    const sourceFile = path.join(testDir, 'source.txt');
    const copiedFile = path.join(testDir, 'copied.txt');
    createFile(sourceFile, 'Content to copy');
    copyFile(sourceFile, copiedFile);
    expect(fs.existsSync(copiedFile)).to.be.true;
    const copiedContent = fs.readFileSync(copiedFile, 'utf8');
    expect(copiedContent).to.equal('Content to copy');
  });

  it('should move a file', () => {
    // Create a source file and then move it.
    const sourceFile = path.join(testDir, 'moveSource.txt');
    const destinationFile = path.join(testDir, 'moved.txt');
    createFile(sourceFile, 'Content to move');
    moveFile(sourceFile, destinationFile);
    expect(fs.existsSync(destinationFile)).to.be.true;
    expect(fs.existsSync(sourceFile)).to.be.false;
    const movedContent = fs.readFileSync(destinationFile, 'utf8');
    expect(movedContent).to.equal('Content to move');
  });
});