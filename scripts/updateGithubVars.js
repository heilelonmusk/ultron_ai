// scripts/updateGithubVars.js
const { Octokit } = require("@octokit/rest");
const sodium = require('tweetsodium');

// Function to update a GitHub secret for a repository
async function updateGithubSecret() {
  // Questi valori devono essere impostati come variabili d'ambiente o tramite config
  const owner = process.env.GITHUB_OWNER;           // e.g. 'heilelonmusk'
  const repo = process.env.GITHUB_REPO;             // e.g. 'ultron_ai'
  const secretName = 'MY_GITHUB_SECRET';            // nome della secret che vuoi aggiornare
  const secretValue = process.env.MY_GITHUB_SECRET_VALUE; // nuovo valore per la secret
  const githubToken = process.env.GITHUB_TOKEN;     // token con permessi per il repository

  if (!owner || !repo || !secretName || !secretValue || !githubToken) {
    throw new Error('One or more required environment variables are missing.');
  }

  // Crea l'istanza di Octokit
  const octokit = new Octokit({ auth: githubToken });

  // Recupera la chiave pubblica per il repository
  const { data: publicKeyData } = await octokit.actions.getRepoPublicKey({
    owner,
    repo,
  });
  const publicKey = publicKeyData.key;
  const keyId = publicKeyData.key_id;

  // Cifra il valore della secret usando tweetsodium
  const messageBytes = Buffer.from(secretValue);
  const keyBytes = Buffer.from(publicKey, 'base64');
  const encryptedBytes = sodium.seal(messageBytes, keyBytes);
  const encryptedValue = Buffer.from(encryptedBytes).toString('base64');

  // Aggiorna o crea la secret nel repository
  await octokit.actions.createOrUpdateRepoSecret({
    owner,
    repo,
    secret_name: secretName,
    encrypted_value: encryptedValue,
    key_id: keyId,
  });

  console.log(`Secret "${secretName}" updated successfully.`);
}

// Se il modulo viene eseguito direttamente, avvia la funzione
if (require.main === module) {
  updateGithubSecret().catch(err => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { updateGithubSecret };