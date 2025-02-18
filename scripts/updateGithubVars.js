import 'dotenv/config';
import { Octokit } from '@octokit/rest';
import tweetsodium from 'tweetsodium';

export async function updateGithubSecret() {
  const owner = process.env.MY_GITHUB_OWNER;
  const repo = process.env.MY_GITHUB_REPO;
  const token = process.env.MY_GITHUB_TOKEN; // da usare anche per l'autenticazione

  // Verifica che non manchi nulla
  if (!owner || !repo || !token) {
    throw new Error('Missing required environment variables: MY_GITHUB_OWNER, MY_GITHUB_REPO, MY_GITHUB_TOKEN');
  }

  // Nome della secret su GitHub
  const secretName = 'MY_GITHUB_TOKEN';

  // Ottokit con lo stesso token (se usi un solo token per tutto)
  const octokit = new Octokit({ auth: token });

  // GET: public key
  const { data: publicKeyData } = await octokit.actions.getRepoPublicKey({ owner, repo });
  const publicKey = publicKeyData.key;
  const keyId = publicKeyData.key_id;

  // Cifra il token
  const messageBytes = Buffer.from(token);
  const keyBytes = Buffer.from(publicKey, 'base64');
  const encryptedBytes = tweetsodium.seal(messageBytes, keyBytes);
  const encryptedValue = Buffer.from(encryptedBytes).toString('base64');

  // PUT: secret
  await octokit.actions.createOrUpdateRepoSecret({
    owner,
    repo,
    secret_name: secretName,
    encrypted_value: encryptedValue,
    key_id: keyId
  });

  console.log(`Secret "${secretName}" updated successfully.`);
}

// Se vuoi farlo girare da CLI
if (import.meta.url === process.argv[1] || import.meta.url === new URL(process.argv[1], 'file://').href) {
  updateGithubSecret().catch(err => {
    console.error(err);
    process.exit(1);
  });
}