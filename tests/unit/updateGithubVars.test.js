/**
 * @file updateGithubVars.test.js
 * @description Unit tests for the updateGithubVars function using nock to simulate GitHub API.
 */

import { expect } from 'chai';
import nock from 'nock';
import { updateGithubSecret } from '../../scripts/updateGithubVars.js';

// Setup environment variables needed for the test
process.env.GITHUB_OWNER = 'test-owner';
process.env.GITHUB_REPO = 'test-repo';
process.env.MY_GITHUB_SECRET_VALUE = 'secret_value';
process.env.GITHUB_TOKEN = 'test-token';

describe('updateGithubVars', function () {
  afterEach(() => nock.cleanAll());

  it('should update GitHub secret successfully', async function () {
    const validPublicKey = Buffer.alloc(32).toString('base64');
    const publicKeyResponse = {
      key: validPublicKey,
      key_id: 'key123'
    };

    const scope = nock('https://api.github.com')
      .get('/repos/test-owner/test-repo/actions/secrets/public-key')
      .reply(200, publicKeyResponse)
      .put('/repos/test-owner/test-repo/actions/secrets/MY_GITHUB_SECRET', body => {
        return body.key_id === 'key123' &&
          typeof body.encrypted_value === 'string' &&
          body.encrypted_value.length > 0;
      })
      .reply(200, {});

    await updateGithubSecret();
    expect(scope.isDone()).to.be.true;
  });

  it('should throw an error if GitHub API responds with an error', async function () {
    const validPublicKey = Buffer.alloc(32).toString('base64');
    nock('https://api.github.com')
      .get('/repos/test-owner/test-repo/actions/secrets/public-key')
      .reply(200, { key: validPublicKey, key_id: 'key123' })
      .put('/repos/test-owner/test-repo/actions/secrets/MY_GITHUB_SECRET')
      .reply(400, { error: 'Bad Request' });

    try {
      await updateGithubSecret();
      throw new Error('Test should have failed');
    } catch (error) {
      expect(error.message).to.match(/400|Bad Request/);
    }
  });
});