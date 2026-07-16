import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { fetchPlans, loginWithKey, signupAndEnter } from "../lib/api";

type Mode = "signup" | "enter";

export function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signup");

  const [email, setEmail] = useState("");
  const [plans, setPlans] = useState<string[]>([]);
  const [plan, setPlan] = useState("");
  const [key, setKey] = useState("");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    void fetchPlans()
      .then((available) => {
        if (!active) return;
        setPlans(available);
        if (available.length > 0) setPlan(available[0] ?? "");
      })
      .catch(() => {
        // plans are best-effort; the field falls back to a free default
      });
    return () => {
      active = false;
    };
  }, []);

  async function onSignup(event: FormEvent) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const tenant = await signupAndEnter(email, plan);
      navigate(`/t/${tenant}`, { replace: true });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "signup_failed");
    } finally {
      setBusy(false);
    }
  }

  async function onEnter(event: FormEvent) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const tenant = await loginWithKey(key.trim());
      navigate(`/t/${tenant}`, { replace: true });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "login_failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login-wrap">
      <div className="login-card">
        <p className="eyebrow">covaga / dashboard</p>
        <h1 style={{ letterSpacing: "-0.03em", margin: "0 0 8px" }}>Sign in</h1>

        {mode === "signup" ? (
          <>
            <p style={{ color: "var(--color-muted)" }}>
              Create an account with your work email. Covaga mints an API key and
              takes you straight in.
            </p>
            <form className="form-row" onSubmit={onSignup}>
              <input
                type="email"
                required
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-label="Work email"
              />
              <select
                aria-label="Plan"
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "13px",
                  border: "1px solid var(--hairline-strong)",
                  borderRadius: "8px",
                  padding: "9px 12px",
                  background: "var(--color-paper)",
                  color: "var(--color-ink)",
                }}
              >
                {plans.length === 0 ? (
                  <option value="">free</option>
                ) : (
                  plans.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))
                )}
              </select>
              <button className="button" type="submit" disabled={busy}>
                {busy ? "creating…" : "create account"}
              </button>
            </form>
          </>
        ) : (
          <>
            <p style={{ color: "var(--color-muted)" }}>
              Already have a key? Paste it to enter. Covaga validates it and never
              stores the plaintext.
            </p>
            <form className="form-row" onSubmit={onEnter}>
              <input
                type="text"
                required
                placeholder="covaga_…"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                aria-label="API key"
              />
              <button className="button" type="submit" disabled={busy}>
                {busy ? "checking…" : "enter"}
              </button>
            </form>
          </>
        )}

        {error !== "" && (
          <p style={{ color: "var(--color-err)", fontSize: "13px" }}>{error}</p>
        )}

        <p style={{ marginTop: 16, fontSize: 13 }}>
          {mode === "signup" ? (
            <button
              type="button"
              className="button secondary"
              onClick={() => {
                setError("");
                setMode("enter");
              }}
            >
              I already have a key
            </button>
          ) : (
            <button
              type="button"
              className="button secondary"
              onClick={() => {
                setError("");
                setMode("signup");
              }}
            >
              Create an account instead
            </button>
          )}
        </p>

        <p className="notice">
          Covaga authenticates with an API key (header{" "}
          <span className="mono">X-Api-Key</span>). Only its SHA-256 hash is
          stored server-side.
        </p>
      </div>
    </div>
  );
}
