import { describe, it, expect } from "vitest";
import { hashApiKey, generateApiKey } from "../src/lib/crypto.js";

describe("hashApiKey", () => {
  it("returns a stable 64-char hex digest", async () => {
    const first = await hashApiKey("hello-key");
    const second = await hashApiKey("hello-key");
    expect(first).toBe(second);
    expect(first).toMatch(/^[0-9a-f]{64}$/);
  });

  it("produces different digests for different inputs", async () => {
    const a = await hashApiKey("key-a");
    const b = await hashApiKey("key-b");
    expect(a).not.toBe(b);
  });
});

describe("generateApiKey", () => {
  it("returns a non-empty base64url string", () => {
    const key = generateApiKey();
    expect(key).toMatch(/^[0-9A-Za-z_-]+$/);
    expect(key.length).toBeGreaterThan(0);
    expect(generateApiKey()).not.toBe(key);
  });
});
