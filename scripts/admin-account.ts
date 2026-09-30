// Creates the one admin account, or resets its password and two-factor login.
//
//   yarn admin:account you@example.com
//
// Prompts for a new password, then prints the two-factor setup key and eight
// one-time recovery codes. Resetting signs out every session. Uses the
// DATABASE_URL in .env.local (or the environment).
import { createInterface } from "node:readline";
import { Writable } from "node:stream";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import postgres from "postgres";
import { adminSessions, admins } from "../src/db/schema";
import { hashPassword, passwordProblem } from "../src/lib/admin/password";
import { newRecoveryCodes } from "../src/lib/admin/recovery";
import { newTotpSecret, totpUri } from "../src/lib/admin/totp";

process.loadEnvFile?.(".env.local");

const email = process.argv[2]?.trim().toLowerCase();
const url = process.env.DATABASE_URL;
if (!email || !email.includes("@")) {
  console.error("Usage: yarn admin:account you@example.com");
  process.exit(1);
}
if (!url) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

// Typed characters aren't echoed while the password is entered.
let muted = false;
const output = new Writable({
  write(chunk, _encoding, done) {
    if (!muted) process.stdout.write(chunk);
    done();
  },
});
const rl = createInterface({ input: process.stdin, output, terminal: true });
const ask = (question: string, hidden = false) =>
  new Promise<string>((resolve) => {
    process.stdout.write(question);
    muted = hidden;
    rl.question("", (answer) => {
      muted = false;
      if (hidden) process.stdout.write("\n");
      resolve(answer);
    });
  });

const password = await ask("New password (12+ characters): ", true);
const problem = passwordProblem(password);
if (problem) {
  console.error(problem);
  process.exit(1);
}
if ((await ask("Repeat it: ", true)) !== password) {
  console.error("The passwords don't match.");
  process.exit(1);
}
rl.close();

const client = postgres(url, { max: 1 });
const db = drizzle(client);

const secret = newTotpSecret();
const recovery = newRecoveryCodes();
const values = {
  email,
  passwordHash: await hashPassword(password),
  totpSecret: secret,
  totpEnabledAt: new Date(),
  totpLastStep: null,
  recoveryCodes: recovery.hashes,
};

const existing = await db.select({ id: admins.id, email: admins.email }).from(admins);
if (existing.length > 1) {
  console.error("More than one admin account exists; SHERO has one. Remove the extra one first.");
  process.exit(1);
}
if (existing.length === 1) {
  await db.update(admins).set(values).where(eq(admins.id, existing[0].id));
  await db.delete(adminSessions).where(eq(adminSessions.adminId, existing[0].id));
  console.log(`\nReset the admin account (${existing[0].email} → ${email}). Every session is signed out.`);
} else {
  await db.insert(admins).values(values);
  console.log(`\nCreated the admin account for ${email}.`);
}
await client.end();

console.log(`
Two-factor login: in your authenticator app (Google Authenticator, Authy,
1Password), add an account with this setup key:

  ${secret.match(/.{1,4}/g)!.join(" ")}

or open this link on the phone:

  ${totpUri(secret, email)}

Recovery codes (each works once, in place of the 6-digit code; keep them
somewhere safe and offline):

  ${recovery.codes.join("\n  ")}
`);
