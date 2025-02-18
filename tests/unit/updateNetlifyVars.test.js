/**
 * @file updateNetlifyVars.test.js
 * @description Unit tests for the updateNetlifyVars function using nock to simulate Netlify API.
 */

const { expect } = require('chai');
const nock = require('nock');
const { updateNetlifyVars } = require('../../scripts/updateNetlifyVars');

// Imposta variabili d'ambiente per il test
process.env.NETLIFY_SITE_ID = 'test-site-id';
process.env.NETLIFY_AUTH_TOKEN = 'test-auth-token';
process.env.MONGO_URI = 'mongodb://localhost:27017/testdb';

describe('updateNetlifyVars', function () {
  afterEach(function () {
    nock.cleanAll();
  });

  it('should update Netlify variable successfully', async function () {
    // Simula l'endpoint Netlify per PUT su /MONGO_URI
    const apiScope = nock('https://api.netlify.com')
      .put('/api/v1/sites/test-site-id/env/MONGO_URI', { value: process.env.MONGO_URI })
      .matchHeader('Authorization', 'Bearer test-auth-token')
      .matchHeader('Content-Type', 'application/json')
      .reply(200, { ok: true });

    // Esegui la funzione
    await updateNetlifyVars();

    // Verifica che la chiamata sia stata effettuata
    expect(apiScope.isDone()).to.be.true;
  });

  it('should throw an error if Netlify API responds with an error', async function () {
    // Simula una risposta di errore dall'API
    nock('https://api.netlify.com')
      .put('/api/v1/sites/test-site-id/env/MONGO_URI')
      .reply(400, { error: 'Bad Request' });

    try {
      await updateNetlifyVars();
      throw new Error('Test should have failed');
    } catch (error) {
      expect(error.message).to.include('Netlify API responded with 400');
    }
  });
});