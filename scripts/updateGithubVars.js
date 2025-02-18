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
async function updateGithubSecret() {
  // Use dynamic imports per module
  const { Octokit } = await import('@octokit/rest');
  const tweetsodium = await import('tweetsodium');

  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const secretName = 'MY_GITHUB_SECRET';
  const secretValue = process.env.MY_GITHUB_SECRET_VALUE;
  const githubToken = process.env.GITHUB_TOKEN;

  if (!owner || !repo || !secretValue || !githubToken) {
    throw new Error('Missing required environment variables.');
  }

  // Create an Octokit instance
  const octokit = new Octokit({ auth: githubToken });

  // Retrieve the repository public key for secrets
  const { data: publicKeyData } = await octokit.actions.getRepoPublicKey({
    owner,
    repo,
  });
  const publicKey = publicKeyData.key;
  const keyId = publicKeyData.key_id;

  // Encrypt the secret value using tweetsodium.seal
  const messageBytes = Buffer.from(secretValue);
  const keyBytes = Buffer.from(publicKey, 'base64');
  const encryptedBytes = tweetsodium.seal(messageBytes, keyBytes);
  const encryptedValue = Buffer.from(encryptedBytes).toString('base64');

  // Create or update the secret on GitHub
  await octokit.actions.createOrUpdateRepoSecret({
    owner,
    repo,
    secret_name: secretName,
    encrypted_value: encryptedValue,
    key_id: keyId,
  });

  console.log(`Secret "${secretName}" updated successfully.`);
}

// Se il modulo viene eseguito direttamente, esegui la funzione
if (require.main === module) {
  updateGithubSecret().catch(err => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { updateGithubSecret };