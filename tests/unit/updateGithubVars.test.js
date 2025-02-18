/**
 * @file updateGithubVars.test.js
 * @description Unit tests for the updateGithubVars function using nock to simulate GitHub API.
 */

const { expect } = require('chai');
const nock = require('nock');
const { updateGithubSecret } = require('../../scripts/updateGithubVars');

// Imposta le variabili d'ambiente necessarie per il test
process.env.GITHUB_OWNER = 'test-owner';
process.env.GITHUB_REPO = 'test-repo';
process.env.MY_GITHUB_SECRET_VALUE = 'secret_value';
process.env.GITHUB_TOKEN = 'test-token';

describe('updateGithubVars', function () {
  afterEach(() => nock.cleanAll());

  it('should update GitHub secret successfully', async function () {
    // Simula il recupero della chiave pubblica
    const publicKeyResponse = {
      key: 'publicKeyExample==',
      key_id: 'key123'
    };
    const scope = nock('https://api.github.com')
      .get(`/repos/test-owner/test-repo/actions/secrets/public-key`)
      .reply(200, publicKeyResponse)
      .put(`/repos/test-owner/test-repo/actions/secrets/MY_GITHUB_SECRET`, (body) => {
        // Verifica che il body contenga una chiave key_id uguale a 'key123'
        return body.key_id === 'key123' && body.encrypted_value;
      })
      .reply(200, {});

    await updateGithubSecret();
    expect(scope.isDone()).to.be.true;
  });

  it('should throw an error if GitHub API responds with an error', async function () {
    nock('https://api.github.com')
      .get(`/repos/test-owner/test-repo/actions/secrets/public-key`)
      .reply(200, {
        key: 'publicKeyExample==',
        key_id: 'key123'
      })
      .put(`/repos/test-owner/test-repo/actions/secrets/MY_GITHUB_SECRET`)
      .reply(400, { error: 'Bad Request' });

    try {
      await updateGithubSecret();
      throw new Error('Test should have failed');
    } catch (error) {
      expect(error.message).to.include('400');
    }
  });
});