/**
 * @file envManager.test.js
 * @description Unit tests for the envManager CLI.
 * The tests simulate command line invocations and verify that the .env file is updated accordingly.
 */

const { expect } = require('chai');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

describe('envManager CLI', function () {
  const tempDir = path.join(os.tmpdir(), 'envManagerTest');
  const envFilePath = path.join(tempDir, '.env');
  const envManagerScript = path.join(process.cwd(), 'scripts', 'envManager.js');

  // Helper per scrivere un file .env vuoto
  function createEmptyEnvFile() {
    fs.writeFileSync(envFilePath, '', 'utf8');
  }

  before(function () {
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    createEmptyEnvFile();
  });

  after(function () {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  // Imposta l'ambiente per il test (cambia la directory corrente)
  beforeEach(function () {
    process.chdir(tempDir);
  });

  it('should set a new environment variable', function () {
    // Esegui il comando: node scripts/envManager.js set TEST_VAR "test_value"
    execSync(`node ${envManagerScript} set TEST_VAR "test_value"`, { stdio: 'inherit' });
    const envContent = fs.readFileSync(envFilePath, 'utf8');
    expect(envContent).to.include('TEST_VAR=test_value');
  });

  it('should list environment variables', function () {
    // Assicurati che TEST_VAR sia già impostata
    execSync(`node ${envManagerScript} set LIST_VAR "list_value"`, { stdio: 'inherit' });
    const output = execSync(`node ${envManagerScript} list`, { encoding: 'utf8' });
    expect(output).to.include('LIST_VAR');
    expect(output).to.include('list_value');
  });

  it('should delete an environment variable', function () {
    // Imposta una variabile
    execSync(`node ${envManagerScript} set DELETE_VAR "to_delete"`, { stdio: 'inherit' });
    // Elimina la variabile
    execSync(`node ${envManagerScript} delete DELETE_VAR`, { stdio: 'inherit' });
    const envContent = fs.readFileSync(envFilePath, 'utf8');
    expect(envContent).to.not.include('DELETE_VAR');
  });
});