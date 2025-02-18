/**
 * @file updateAllVars.test.js
 * @description Unit tests for the updateAllVars module (ESM + DI).
 */

import { expect } from 'chai';
import sinon from 'sinon';
import { makeUpdateAllVars } from '../../scripts/updateAllVars.js';

describe('updateAllVars Module', function () {
  let updateGithubSecretStub, updateNetlifyVarsStub, updateAllVars;

  beforeEach(function () {
    // Creiamo stub
    updateGithubSecretStub = sinon.stub().resolves();
    updateNetlifyVarsStub = sinon.stub().resolves();

    // "Costruiamo" la funzione updateAllVars iniettando gli stub
    updateAllVars = makeUpdateAllVars({
      updateGithubSecret: updateGithubSecretStub,
      updateNetlifyVars: updateNetlifyVarsStub
    });
  });

  afterEach(function () {
    sinon.restore();
  });

  it('should update GitHub and Netlify variables when both flags are true', async function () {
    process.env.UPDATE_GITHUB_VARS = 'true';
    process.env.UPDATE_NETLIFY_VARS = 'true';

    await updateAllVars();

    expect(updateGithubSecretStub.calledOnce).to.be.true;
    expect(updateNetlifyVarsStub.calledOnce).to.be.true;
  });

  it('should update only GitHub variables when only that flag is true', async function () {
    process.env.UPDATE_GITHUB_VARS = 'true';
    process.env.UPDATE_NETLIFY_VARS = 'false';

    updateGithubSecretStub.resetHistory();
    updateNetlifyVarsStub.resetHistory();

    await updateAllVars();

    expect(updateGithubSecretStub.calledOnce).to.be.true;
    expect(updateNetlifyVarsStub.called).to.be.false;
  });
});