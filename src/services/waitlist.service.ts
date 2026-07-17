/**
 * Waitlist service: collect interested emails while Covaga Hub is still in
 * development. Validates the email, normalises it, and persists it. Duplicate
 * submissions succeed silently (idempotent at the repository), so no email is
 * ever confirmed or denied to the caller — a mild anti-enumeration property.
 * The router stays a thin HTTP adapter; the repository stays pure D1 access.
 */
import type { Env } from "../env.js";
import { HttpError } from "../errors.js";
import { insertWaitlistEntry } from "../repositories/waitlist.repository.js";

/** Validated inputs to {@link joinWaitlist}. */
export interface JoinWaitlistInput {
  /** Raw contact email as typed by the visitor. */
  email: string;
  /** UI locale the visitor signed up from; empty when unknown. */
  locale: string;
}

/** Basic RFC-ish email shape check; not a full validator. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Maximum accepted email length (RFC 5321 limit). */
const MAX_EMAIL_LENGTH = 254;

/** Maximum stored locale length (locale ids are short, e.g. `zh-cn`). */
const MAX_LOCALE_LENGTH = 12;

/**
 * Add an email to the pre-launch waitlist. Idempotent: re-submitting the same
 * address resolves without error.
 *
 * @param env - Worker environment holding the D1 binding.
 * @param input - Requested `{ email, locale }`.
 * @throws {HttpError} 400 `invalid_email` when the email is malformed.
 */
export async function joinWaitlist(
  env: Env,
  input: JoinWaitlistInput,
): Promise<void> {
  const email = input.email.trim().toLowerCase();
  if (
    email.length === 0 ||
    email.length > MAX_EMAIL_LENGTH ||
    !EMAIL_RE.test(email)
  ) {
    throw new HttpError(400, "invalid_email");
  }

  const locale = input.locale.trim().slice(0, MAX_LOCALE_LENGTH);
  await insertWaitlistEntry(env, { email, locale, createdAt: Date.now() });
}
