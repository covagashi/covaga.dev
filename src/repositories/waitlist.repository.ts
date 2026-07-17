import type { Env } from "../env.js";

/** A pre-launch waitlist entry to persist. */
export interface WaitlistEntry {
  /** Contact email, already lowercased and trimmed. */
  email: string;
  /** UI locale the visitor signed up from (e.g. `es`); may be empty. */
  locale: string;
  /** Creation timestamp in epoch milliseconds. */
  createdAt: number;
}

/**
 * Insert a waitlist entry. Re-submitting an existing email is a no-op (the
 * email is the primary key), so the caller can treat every valid submission as
 * a success without a duplicate-error path.
 *
 * @param env - Worker environment holding the D1 binding.
 * @param entry - Fully-formed, already-validated waitlist entry.
 */
export async function insertWaitlistEntry(
  env: Env,
  entry: WaitlistEntry,
): Promise<void> {
  await env.DB.prepare(
    `INSERT INTO waitlist (email, locale, created_at) VALUES (?, ?, ?)
     ON CONFLICT(email) DO NOTHING`,
  )
    .bind(entry.email, entry.locale, entry.createdAt)
    .run();
}
