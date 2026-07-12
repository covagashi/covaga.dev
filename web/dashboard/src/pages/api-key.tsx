import { useState } from "react";
import { loadSession, rotateKey } from "../lib/api";

const MASK = "byndr_****************************";

export function ApiKeyPage() {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [key, setKey] = useState<string>(() => loadSession()?.key ?? "");

  async function onCopy() {
    if (key === "") return;
    try {
      await navigator.clipboard.writeText(key);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setError("copy_failed");
    }
  }

  async function onRotate() {
    setError("");
    setBusy(true);
    try {
      const next = await rotateKey();
      setKey(next);
      setRevealed(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "rotate_failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <p className="eyebrow">credentials</p>
      <h1>API key</h1>
      <p className="page-sub">
        Your client scripts authenticate with this key (header{" "}
        <span className="mono">X-Api-Key</span>). byndr stores only its SHA-256
        hash; the plaintext is shown once at creation or rotation.
      </p>

      <div className="card">
        <h2>Current key</h2>
        <p className="mono">{revealed && key !== "" ? key : MASK}</p>
        <div className="form-row">
          <button
            className="button secondary"
            type="button"
            onClick={() => setRevealed((value) => !value)}
          >
            {revealed ? "hide" : "reveal"}
          </button>
          <button
            className="button secondary"
            type="button"
            onClick={onCopy}
            disabled={key === ""}
          >
            {copied ? "copied" : "copy"}
          </button>
          <button
            className="button"
            type="button"
            onClick={onRotate}
            disabled={busy}
          >
            {busy ? "rotating…" : "rotate key"}
          </button>
        </div>
        {error !== "" && (
          <p style={{ marginTop: 16, color: "var(--color-err)" }}>{error}</p>
        )}
      </div>

      <p className="notice">
        Rotating invalidates the old key immediately and shows the new one here
        exactly once. Store it in your client before leaving this page.
      </p>
    </>
  );
}
