/**
 * Signup service: self-service account creation. Validates the requested email
 * and plan, mints a tenant with a fresh API key, and returns the raw key
 * exactly once. The router stays a thin HTTP adapter; the repository stays pure
 * D1 access.
 */
import type { Env } from "../env.js";
import { HttpError } from "../errors.js";
import { generateApiKey, hashApiKey } from "../lib/crypto.js";
import { isPlan } from "../models/plan.js";
import { insertTenant } from "../repositories/tenant.repository.js";

/** Validated inputs to {@link createAccount}. */
export interface CreateAccountInput {
  /** Contact email for the new account. */
  email: string;
  /** Chosen plan id. */
  plan: string;
}

/** Result of a successful signup: the new tenant id and its one-time key. */
export interface CreateAccountResult {
  /** Stable identifier of the created tenant. */
  tenant_id: string;
  /** Raw API key, returned exactly once and never stored in the clear. */
  api_key: string;
}

/** Basic RFC-ish email shape check; not a full validator. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Maximum accepted email length (RFC 5321 limit). */
const MAX_EMAIL_LENGTH = 254;

/**
 * Detect the D1 UNIQUE-constraint violation raised when an email is already in
 * use, so it can be mapped to a friendly 409.
 *
 * @param error - Error thrown by the insert.
 * @returns `true` when the failure is the email uniqueness violation.
 */
function isEmailTaken(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes("UNIQUE constraint failed") &&
    (message.includes("tenants.email") || message.includes("idx_tenants_email"))
  );
}

/**
 * Create a tenant account from a validated email and plan, minting a fresh API
 * key. The raw key is returned once and only its hash is persisted.
 *
 * @param env - Worker environment holding the D1 binding.
 * @param input - Requested `{ email, plan }`.
 * @returns The new tenant id and its raw API key.
 * @throws {HttpError} 400 `invalid_email` / `invalid_plan` on bad input;
 *   409 `email_taken` when the email is already registered.
 */
export async function createAccount(
  env: Env,
  input: CreateAccountInput,
): Promise<CreateAccountResult> {
  const email = input.email.trim();
  if (
    email.length === 0 ||
    email.length > MAX_EMAIL_LENGTH ||
    !EMAIL_RE.test(email)
  ) {
    throw new HttpError(400, "invalid_email");
  }
  if (!isPlan(input.plan)) {
    throw new HttpError(400, "invalid_plan");
  }

  const id = `t_${crypto.randomUUID().replace(/-/g, "")}`;
  const apiKey = generateApiKey();
  const apiKeyHash = await hashApiKey(apiKey);

  try {
    await insertTenant(env, {
      id,
      name: email,
      apiKeyHash,
      email: email.toLowerCase(),
      plan: input.plan,
      createdAt: Date.now(),
    });
  } catch (error: unknown) {
    if (isEmailTaken(error)) {
      throw new HttpError(409, "email_taken");
    }
    throw error;
  }

  return { tenant_id: id, api_key: apiKey };
}
