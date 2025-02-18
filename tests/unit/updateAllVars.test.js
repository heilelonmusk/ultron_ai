/**
 * @file updateAllVars.test.js
 * @description Unit tests for the updateAllVars module.
 * The tests use proxyquire and sinon to stub dependent update functions.
 */

const { expect } = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

describe('updateAllVars Module', function () {
  let updateGithubSecretStub, updateNetlifyVarsStub, updateAllVars;
  
  before(function () {
    // Crea stub per le funzioni di aggiornamento
    updateGithubSecretStub = sinon.stub().resolves();
    updateNetlifyVarsStub = sinon.stub().resolves();
    
    // Usa proxyquire per sostituire i moduli dipendenti
    updateAllVars = proxyquire('../../scripts/updateAllVars.js', {
      './updateGithubVars': { updateGithubSecret: updateGithubSecretStub },
      './updateNetlifyVars': { updateNetlifyVars: updateNetlifyVarsStub }
    }).updateAllVars;
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
    
    // Reset stub history
    updateGithubSecretStub.resetHistory();
    updateNetlifyVarsStub.resetHistory();
    
    await updateAllVars();
    
    expect(updateGithubSecretStub.calledOnce).to.be.true;
    expect(updateNetlifyVarsStub.called).to.be.false;
  });
});