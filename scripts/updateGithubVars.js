// scripts/updateGithubVars.js
/**
 * Updates a GitHub secret (MY_GITHUB_SECRET) for the repository.
 * Reads the following environment variables:
 *   - MY_GITHUB_OWNER: Repository owner (e.g., 'test-owner')
 *   - MY_GITHUB_REPO: Repository name (e.g., 'test-repo')
 *   - MY_GITHUB_SECRET_VALUE: The new secret value to set
 *   - MY_GITHUB_TOKEN: A token with appropriate repository permissions
 *
 * @returns {Promise<void>}
 */

import 'dotenv/config'; // Se vuoi caricare .env qui
import { Octokit } from '@octokit/rest';
import tweetsodiumModule from 'tweetsodium';

export async function updateGithubSecret() {
  // Extract the 'seal' function from tweetsodium default
  const { default: seal } = tweetsodiumModule;

  const owner = process.env.MY_GITHUB_OWNER;
  const repo = process.env.MY_GITHUB_REPO;
  const secretName = 'MY_GITHUB_TOKEN';
  const githubToken = process.env.MY_GITHUB_TOKEN;
  // Qui correzione: la variabile effettiva del segreto
  const secretValue = process.env.MY_GITHUB_SECRET_VALUE;

  if (!owner || !repo || !secretValue || !githubToken) {
    throw new Error('Missing required environment variables (MY_GITHUB_OWNER, MY_GITHUB_REPO, MY_GITHUB_SECRET_VALUE, MY_GITHUB_TOKEN).');
  }

  // Create Octokit instance
  const octokit = new Octokit({ auth: githubToken });

  // Get the repository’s public key
  const { data: publicKeyData } = await octokit.actions.getRepoPublicKey({
    owner,
    repo
  });
  const publicKey = publicKeyData.key;
  const keyId = publicKeyData.key_id;

  // Encrypt the secret value using 'seal'
  const messageBytes = Buffer.from(secretValue);
  const keyBytes = Buffer.from(publicKey, 'base64');
  const encryptedBytes = seal(messageBytes, keyBytes);
  const encryptedValue = Buffer.from(encryptedBytes).toString('base64');

  // Create or update the secret in the GitHub repo
  await octokit.actions.createOrUpdateRepoSecret({
    owner,
    repo,
    secret_name: secretName,
    encrypted_value: encryptedValue,
    key_id: keyId
  });

  console.log(`Secret "${secretName}" updated successfully.`);
}

// If file is run directly from the CLI, execute the function
if (import.meta.url === process.argv[1] || import.meta.url === new URL(process.argv[1], 'file://').href) {
  updateGithubSecret().catch(err => {
    console.error(err);
    process.exit(1);
  });
}