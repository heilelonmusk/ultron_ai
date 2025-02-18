// scripts/updateGithubVars.js
async function updateGithubSecret() {
  // Import dynamic ES module for Octokit
  const { Octokit } = await import('@octokit/rest');
  
  // Import tweetsodium in CommonJS (controllando se la funzione è sotto .seal o .default)
  const tweetsodiumModule = require('tweetsodium');
  const seal = tweetsodiumModule.seal || tweetsodiumModule.default;
  
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const secretName = 'MY_GITHUB_SECRET';
  const secretValue = process.env.MY_GITHUB_SECRET_VALUE;
  const githubToken = process.env.GITHUB_TOKEN;
  
  if (!owner || !repo || !secretValue || !githubToken) {
    throw new Error('Missing required environment variables.');
  }
  
  // Crea un'istanza di Octokit
  const octokit = new Octokit({ auth: githubToken });
  
  // Recupera la chiave pubblica per aggiornare la secret
  const { data: publicKeyData } = await octokit.actions.getRepoPublicKey({
    owner,
    repo,
  });
  const publicKey = publicKeyData.key;
  const keyId = publicKeyData.key_id;
  
  // Cifra il valore della secret usando la funzione 'seal'
  const messageBytes = Buffer.from(secretValue);
  const keyBytes = Buffer.from(publicKey, 'base64');
  const encryptedBytes = seal(messageBytes, keyBytes);
  const encryptedValue = Buffer.from(encryptedBytes).toString('base64');
  
  // Crea o aggiorna la secret nel repository GitHub
  await octokit.actions.createOrUpdateRepoSecret({
    owner,
    repo,
    secret_name: secretName,
    encrypted_value: encryptedValue,
    key_id: keyId,
  });
  
  console.log(`Secret "${secretName}" updated successfully.`);
}

if (require.main === module) {
  updateGithubSecret().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { updateGithubSecret };