// config/envConfig.js
import 'dotenv/config';

/**
 * Loads configuration variables from the environment.
 * It uses process.env and provides default values when necessary.
 */
const config = {
  // MongoDB
  mongoUri: process.env.MONGO_URI || '',

  // Redis
  redis: {
    host: process.env.REDIS_HOST || '',
    port: process.env.REDIS_PORT || '',
    password: process.env.REDIS_PASSWORD || ''
  },

  // Netlify
  netlifySiteId: process.env.NETLIFY_SITE_ID || '',
  netlifyAuthToken: process.env.NETLIFY_AUTH_TOKEN || '',

  // GitHub
  // Se stai usando un unico token anche per l'autenticazione e per salvare la secret,
  // puoi assegnarlo a "myGithubToken". Altrimenti puoi creare due campi separati.
  myGithubToken: process.env.MY_GITHUB_TOKEN || '',

  // Se vuoi definire anche owner e repo come config
  myGithubOwner: process.env.MY_GITHUB_OWNER || '',
  myGithubRepo: process.env.MY_GITHUB_REPO || '',
  // Se hai un URL del repo in qualche variabile
  myGithubRepoUrl: process.env.MY_GITHUB_REPO_URL || '',

  // Flag per aggiornare GitHub e Netlify
  updateGithubVars: process.env.UPDATE_GITHUB_VARS || '',
  updateNetlifyVars: process.env.UPDATE_NETLIFY_VARS || ''
  // Aggiungi altre variabili se necessario
};

export default config;