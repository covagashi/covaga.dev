#!/usr/bin/env node
// Onboard a new tenant: generate an id + raw API key, hash the key with
// SHA-256, and emit the INSERT SQL. Dependency-free (Node built-in crypto).
//
// Usage:
//   node scripts/create-tenant.mjs "Acme Inc"
//   node scripts/create-tenant.mjs "Acme Inc" --exec   # runs wrangler d1 execute
//
// The raw API key is printed ONCE. Save it now; it is never recoverable.

import { randomBytes, createHash } from "node:crypto";
import { spawnSync } from "node:child_process";

/** Base64url-encode a buffer (no padding). */
function base64url(buffer) {
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/** SHA-256 hex digest of a string. */
function sha256Hex(value) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function main() {
  const args = process.argv.slice(2);
  const exec = args.includes("--exec");
  const name = args.find((arg) => !arg.startsWith("--"));

  if (name === undefined || name.trim().length === 0) {
    console.error('Usage: node scripts/create-tenant.mjs "<name>" [--exec]');
    process.exit(1);
  }

  const id = `t_${base64url(randomBytes(9))}`;
  const rawApiKey = base64url(randomBytes(32));
  const apiKeyHash = sha256Hex(rawApiKey);
  const createdAt = Date.now();

  const sql =
    "INSERT INTO tenants (id, name, api_key_hash, created_at) VALUES " +
    `('${id}', '${name.replace(/'/g, "''")}', '${apiKeyHash}', ${createdAt});`;

  if (exec) {
    const result = spawnSync(
      "wrangler",
      ["d1", "execute", "byndr-dev", "--command", sql],
      { stdio: "inherit", shell: true },
    );
    if (result.status !== 0) {
      console.error("wrangler d1 execute failed.");
      process.exit(result.status ?? 1);
    }
  } else {
    console.log("-- Run this against your D1 database:");
    console.log(sql);
    console.log();
  }

  console.log("=== SAVE THIS NOW (shown only once) ===");
  console.log(`tenant id : ${id}`);
  console.log(`name      : ${name}`);
  console.log(`API key   : ${rawApiKey}`);
  console.log("=======================================");
}

main();
