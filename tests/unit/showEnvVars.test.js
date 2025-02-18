/**
 * @file showEnvVars.test.js
 * @description Unit tests for the showEnvVars functionality.
 * The test captures console output to verify that the expected environment variables are printed.
 */

const { expect } = require('chai');
const { execSync } = require('child_process');
const path = require('path');

// Imposta le variabili d'ambiente per il test
before(function () {
  process.env.REDIS_HOST = 'localhost';
  process.env.REDIS_PORT = '6379';
  process.env.MONGO_URI = 'mongodb://localhost:27017/testdb';
});

describe('showEnvVars', function () {
  it('should output the relevant environment variables', function () {
    // Costruisci il percorso assoluto dello script, assumendo che la root del repository sia due livelli sopra __dirname
    const repoRoot = path.resolve(__dirname, '../../');
    const showEnvScript = path.join(repoRoot, 'scripts', 'showEnvVars.js');

    // Esegui lo script specificando il cwd come la root del repository
    const output = execSync(`node ${showEnvScript}`, { encoding: 'utf8', cwd: repoRoot });
    
    // Verifica che l'output contenga le variabili attese
    expect(output).to.include('REDIS_HOST: localhost');
    expect(output).to.include('REDIS_PORT: 6379');
    expect(output).to.include('MONGO_URI: mongodb://localhost:27017/testdb');
  });
});