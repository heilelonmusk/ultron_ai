// updateGithubVars.test.js
import { expect } from 'chai';
import nock from 'nock';
import { updateGithubSecret } from '../../scripts/updateGithubVars.js';

describe('updateGithubVars', () => {
  beforeEach(() => {
    // Imposta TUTTE le env necessarie per far sì che lo script non fallisca subito
    process.env.MY_GITHUB_OWNER = 'test-owner';
    process.env.MY_GITHUB_REPO = 'test-repo';
    process.env.MY_GITHUB_TOKEN = 'test-token';
  });

  afterEach(() => {
    nock.cleanAll();
    // Se vuoi, rimuovi o reimposta le variabili d’ambiente qui
  });

  it('should update GitHub secret successfully', async () => {
    // nock simula la GET per publicKey
    const validPublicKey = Buffer.alloc(32).toString('base64');
    const publicKeyResponse = { key: validPublicKey, key_id: 'key123' };

    const scope = nock('https://api.github.com')
      .get('/repos/test-owner/test-repo/actions/secrets/public-key')
      .reply(200, publicKeyResponse)
      .put('/repos/test-owner/test-repo/actions/secrets/MY_GITHUB_TOKEN', body => {
        return body.key_id === 'key123' &&
               typeof body.encrypted_value === 'string' &&
               body.encrypted_value.length > 0;
      })
      .reply(200, {});

    await updateGithubSecret();
    expect(scope.isDone()).to.be.true;
  });

  it('should throw an error if GitHub API responds with an error', async () => {
    const validPublicKey = Buffer.alloc(32).toString('base64');

    // nock GET per la chiave -> 200
    nock('https://api.github.com')
      .get('/repos/test-owner/test-repo/actions/secrets/public-key')
      .reply(200, { key: validPublicKey, key_id: 'key123' })

      // e la PUT -> 400
      .put('/repos/test-owner/test-repo/actions/secrets/MY_GITHUB_TOKEN')
      .reply(400, { error: 'Bad Request' });

    try {
      await updateGithubSecret();
      throw new Error('Test should have failed');
    } catch (error) {
      expect(error.message).to.match(/400|Bad Request/);
    }
  });
});