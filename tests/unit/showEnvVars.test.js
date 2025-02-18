/**
 * @file showEnvVars.test.js
 * @description Unit tests for the showEnvVars functionality.
 * The test captures console output to verify that the expected environment variables are printed.
 */

import { expect } from 'chai';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

before(function () {
  process.env.REDIS_HOST = 'localhost';
  process.env.REDIS_PORT = '6379';
  process.env.MONGO_URI = 'mongodb://localhost:27017/testdb';
});

describe('showEnvVars', function () {
  it('should output the relevant environment variables', function () {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    // Assume the repo root is two levels up from __dirname
    const repoRoot = path.resolve(__dirname, '../../');
    const showEnvScript = path.join(repoRoot, 'scripts', 'showEnvVars.js');

    const output = execSync(`node ${showEnvScript}`, {
      encoding: 'utf8',
      cwd: repoRoot
    });

    expect(output).to.include('REDIS_HOST: localhost');
    expect(output).to.include('REDIS_PORT: 6379');
    expect(output).to.include('MONGO_URI: mongodb://localhost:27017/testdb');
  });
});