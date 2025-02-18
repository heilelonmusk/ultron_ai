/**
 * @file updateAllVars.test.js
 * @description Unit tests for the updateAllVars module.
 * Uses proxyquire and sinon to stub dependent update functions.
 */

import { expect } from 'chai';
import sinon from 'sinon';
import path from 'path';
import { fileURLToPath } from 'url';

// ATTENZIONE: proxyquire non è compatibile nativamente con ESM.
// Si può provare a importarlo come CommonJS dinamico o utilizzare un approccio alternativo.

let proxyquire;
try {
  // Carichiamo proxyquire come CommonJS, se possibile
  // (Questo è un workaround, potrebbe non funzionare in tutti gli ambienti)
  // eslint-disable-next-line global-require
  proxyquire = require('proxyquire');
} catch (err) {
  console.warn('proxyquire is not fully compatible with ESM. Tests may fail:', err);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

process.chdir(__dirname);

describe('updateAllVars Module', function () {
  let updateGithubSecretStub, updateNetlifyVarsStub, updateAllVars;

  before(function () {
    updateGithubSecretStub = sinon.stub().resolves();
    updateNetlifyVarsStub = sinon.stub().resolves();

    if (!proxyquire) {
      this.skip(); // salta i test se proxyquire non è disponibile
    } else {
      // Usa proxyquire per sostituire i moduli dipendenti
      const { updateAllVars: _updateAllVars } = proxyquire('../../scripts/updateAllVars.js', {
        './updateGithubVars': { updateGithubSecret: updateGithubSecretStub },
        './updateNetlifyVars': { updateNetlifyVars: updateNetlifyVarsStub }
      });
      updateAllVars = _updateAllVars;
    }
  });

  afterEach(function () {
    sinon.restore();
  });

  it('should update GitHub and Netlify variables when both flags are true', async function () {
    if (!updateAllVars) this.skip();

    process.env.UPDATE_GITHUB_VARS = 'true';
    process.env.UPDATE_NETLIFY_VARS = 'true';

    await updateAllVars();

    expect(updateGithubSecretStub.calledOnce).to.be.true;
    expect(updateNetlifyVarsStub.calledOnce).to.be.true;
  });

  it('should update only GitHub variables when only that flag is true', async function () {
    if (!updateAllVars) this.skip();

    process.env.UPDATE_GITHUB_VARS = 'true';
    process.env.UPDATE_NETLIFY_VARS = 'false';

    updateGithubSecretStub.resetHistory();
    updateNetlifyVarsStub.resetHistory();

    await updateAllVars();

    expect(updateGithubSecretStub.calledOnce).to.be.true;
    expect(updateNetlifyVarsStub.called).to.be.false;
  });
});