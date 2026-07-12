/**
 * Convert a byte buffer to a lowercase hex string.
 */
function toHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let hex = "";
  for (const byte of bytes) {
    hex += byte.toString(16).padStart(2, "0");
  }
  return hex;
}

/**
 * Hash a raw API key with SHA-256 and return the 64-character hex digest.
 *
 * @param key - Raw API key as provided by the client.
 */
export async function hashApiKey(key: string): Promise<string> {
  const data = new TextEncoder().encode(key);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return toHex(digest);
}

/**
 * Generate a cryptographically random API key as a base64url string.
 *
 * @param byteLength - Number of random bytes (defaults to 32).
 */
export function generateApiKey(byteLength = 32): string {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}
