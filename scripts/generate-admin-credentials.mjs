import { randomBytes, scryptSync } from 'node:crypto';

if (!process.stdin.isTTY) {
  process.stderr.write('Run this command in an interactive terminal.\n');
  process.exit(1);
}

function askHidden(prompt) {
  return new Promise((resolve, reject) => {
    let value = '';
    process.stdout.write(prompt);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    const onData = (chunk) => {
      for (const char of chunk.toString()) {
        if (char === '\r' || char === '\n') {
          process.stdin.off('data', onData);
          process.stdin.setRawMode(false);
          process.stdin.pause();
          process.stdout.write('\n');
          resolve(value);
          return;
        }
        if (char === '\u0003') {
          process.stdin.setRawMode(false);
          process.stdout.write('\n');
          reject(new Error('Cancelled'));
          return;
        }
        if (char === '\u007f' || char === '\b') value = value.slice(0, -1);
        else if (char >= ' ' && char !== '\u007f') value += char;
      }
    };
    process.stdin.on('data', onData);
  });
}

const password = await askHidden('New admin password (at least 16 characters; input hidden): ');
if (password.length < 16) {
  process.stderr.write('Password must be at least 16 characters.\n');
  process.exit(1);
}
const confirmation = await askHidden('Confirm admin password (input hidden): ');
if (password !== confirmation) {
  process.stderr.write('Passwords do not match.\n');
  process.exit(1);
}
const salt = randomBytes(32);
process.stdout.write('ADMIN_USERNAME=admin\n');
process.stdout.write(`ADMIN_PASSWORD_HASH=scrypt:${salt.toString('hex')}:${scryptSync(password, salt, 64).toString('hex')}\n`);
process.stdout.write(`ADMIN_SESSION_SECRET=${randomBytes(48).toString('base64url')}\n`);
