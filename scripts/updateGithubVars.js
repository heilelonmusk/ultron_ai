// scripts/updateGithubVars.js
/**
 * Updates a GitHub secret (MY_GITHUB_SECRET) for the repository.
 * Reads the following environment variables:
 *   - GITHUB_OWNER: Repository owner (e.g., 'test-owner')
 *   - GITHUB_REPO: Repository name (e.g., 'test-repo')
 *   - MY_GITHUB_SECRET_VALUE: The new secret value to set
 *   - GITHUB_TOKEN: A token with appropriate repository permissions
 *
 * @returns {Promise<void>}
 */
 
import { Octokit } from '@octokit/rest';
import tweetsodiumModule from 'tweetsodium';

async function updateGithubSecret() {
  // Ottieni la funzione 'seal' dal default export di tweetsodiumModule
  const { default: seal } = tweetsodiumModule;

  const owner = process.env.MY_GITHUB_OWNER;
  const repo = process.env.MY_GITHUB_REPO;
  const secretName = 'MY_GITHUB_TOKEN';
  const githubToken = process.env.MY_GITHUB_TOKEN;
  const url = process.env.MY_GITHUB_URL;

  if (!owner || !repo || !secretValue || !githubToken) {
    throw new Error('Missing required environment variables.');
  }

  // Crea un'istanza di Octokit
  const octokit = new Octokit({ auth: githubToken });

  // Recupera la chiave pubblica per le secret del repository
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

  // Crea o aggiorna la secret sul repository GitHub
  await octokit.actions.createOrUpdateRepoSecret({
    owner,
    repo,
    secret_name: secretName,
    encrypted_value: encryptedValue,
    key_id: keyId,
  });

  console.log(`Secret "${secretName}" updated successfully.`);
}

// Se il modulo viene eseguito direttamente, esegue la funzione
if (process.argv[1] === new URL(import.meta.url).pathname) {
  updateGithubSecret().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

export { updateGithubSecret };