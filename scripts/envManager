// scripts/envManager.js
const fs = require('fs');
const path = require('path');
const { program } = require('commander');

const envPath = path.join(process.cwd(), '.env');

/**
 * Reads current .env content as an object.
 */
function readEnv() {
  if (!fs.existsSync(envPath)) return {};
  const data = fs.readFileSync(envPath, 'utf8');
  return data.split('\n').reduce((acc, line) => {
    const [key, ...vals] = line.split('=');
    if (key) {
      acc[key.trim()] = vals.join('=').trim();
    }
    return acc;
  }, {});
}

/**
 * Writes an object to .env file.
 * @param {Object} envObj - The environment variables.
 */
function writeEnv(envObj) {
  const content = Object.entries(envObj)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  fs.writeFileSync(envPath, content, 'utf8');
}

program
  .command('set <key> <value>')
  .description('Set an environment variable')
  .action((key, value) => {
    const envObj = readEnv();
    envObj[key] = value;
    writeEnv(envObj);
    console.log(`Variable ${key} set to ${value}`);
  });

program
  .command('delete <key>')
  .description('Delete an environment variable')
  .action((key) => {
    const envObj = readEnv();
    if (envObj[key]) {
      delete envObj[key];
      writeEnv(envObj);
      console.log(`Variable ${key} deleted`);
    } else {
      console.log(`Variable ${key} not found`);
    }
  });

program
  .command('list')
  .description('List all environment variables')
  .action(() => {
    const envObj = readEnv();
    console.log('Current environment variables:');
    console.log(envObj);
  });

program.parse(process.argv);