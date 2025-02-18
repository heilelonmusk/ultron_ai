/**
 * @file envManager.test.js
 * @description Unit tests for the envManager CLI.
 * Tests focus on managing the .env file locally, ensuring that variables can be set, listed, and deleted.
 */

import { expect } from 'chai';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

describe('envManager CLI', function () {
  // Create a temporary directory for testing .env in isolation
  const tempDir = path.join(os.tmpdir(), 'envManagerTest');
  const envFilePath = path.join(tempDir, '.env');
  let envManagerScript;

  function createEmptyEnvFile() {
    fs.writeFileSync(envFilePath, '', 'utf8');
  }

  before(function () {
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    createEmptyEnvFile();

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    // If the script is at /scripts/envManager.js from repo root:
    envManagerScript = path.resolve(__dirname, '../../scripts/envManager.js');
  });

  after(function () {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  beforeEach(function () {
    process.chdir(tempDir);
  });

  it('should set a new environment variable', function () {
    execSync(`node ${envManagerScript} set TEST_VAR "test_value"`, { stdio: 'inherit' });
    const envContent = fs.readFileSync(envFilePath, 'utf8');
    expect(envContent).to.include('TEST_VAR=test_value');
  });

  it('should list environment variables', function () {
    execSync(`node ${envManagerScript} set LIST_VAR "list_value"`, { stdio: 'inherit' });
    const output = execSync(`node ${envManagerScript} list`, { encoding: 'utf8' });
    expect(output).to.include('LIST_VAR');
    expect(output).to.include('list_value');
  });

  it('should delete an environment variable', function () {
    execSync(`node ${envManagerScript} set DELETE_VAR "to_delete"`, { stdio: 'inherit' });
    execSync(`node ${envManagerScript} delete DELETE_VAR`, { stdio: 'inherit' });
    const envContent = fs.readFileSync(envFilePath, 'utf8');
    expect(envContent).to.not.include('DELETE_VAR');
  });
});