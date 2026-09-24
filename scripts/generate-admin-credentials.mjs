import { randomBytes, scryptSync } from 'node:crypto';
import { createInterface } from 'node:readline/promises';

const io = createInterface({ input: process.stdin, output: process.stdout });
const password = await io.question('New admin password (at least 16 characters): ');
io.close();
if (password.length < 16) {
  process.stderr.write('Password must be at least 16 characters.\n');
  process.exit(1);
}
const salt = randomBytes(32);
process.stdout.write(`ADMIN_PASSWORD_HASH=scrypt:${salt.toString('hex')}:${scryptSync(password, salt, 64).toString('hex')}\n`);
process.stdout.write(`ADMIN_SESSION_SECRET=${randomBytes(48).toString('base64url')}\n`);
