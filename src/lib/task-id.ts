/**
 * Opaque task identifiers for the Gym. A task id is a base64url-encoded
 * compact JSON payload, so `submitProposal` can recover the target of a
 * proposal without server-side session state. Pure logic, no I/O.
 */

/** The decoded contents of a task id. */
export interface TaskDescriptor {
  /** Manufacturer part number the task targets. */
  partNumber: string;
  /** Variant discriminator; empty string when the part has no variant. */
  variant: string;
  /** Kind of gap the task closes. */
  taskType: "translate" | "describe";
  /** Article field the task edits (currently always `description`). */
  field: string;
  /** Target language for `translate`; empty string for `describe`. */
  lang: string;
}

/** Compact wire form: short keys keep the encoded id small and opaque. */
interface CompactTask {
  p: string;
  v: string;
  t: "translate" | "describe";
  f: string;
  l: string;
}

/** Encode raw bytes as an unpadded base64url string. */
function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Decode an unpadded base64url string back into raw bytes. */
function fromBase64Url(text: string): Uint8Array {
  const padded = text
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(Math.ceil(text.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Encode a task descriptor into an opaque, URL-safe id.
 *
 * @param task - The task descriptor to encode.
 * @returns A base64url string round-trippable via {@link decodeTaskId}.
 */
export function encodeTaskId(task: TaskDescriptor): string {
  const compact: CompactTask = {
    p: task.partNumber,
    v: task.variant,
    t: task.taskType,
    f: task.field,
    l: task.lang,
  };
  const json = JSON.stringify(compact);
  return toBase64Url(new TextEncoder().encode(json));
}

/** Narrow an unknown parsed value to a well-formed compact task. */
function asCompactTask(value: unknown): CompactTask {
  if (Object(value) !== value || Array.isArray(value)) {
    throw new Error("invalid_task_id");
  }
  const record = value as Record<string, unknown>;
  const { p, v, t, f, l } = record;
  if (
    typeof p !== "string" ||
    typeof v !== "string" ||
    (t !== "translate" && t !== "describe") ||
    typeof f !== "string" ||
    typeof l !== "string"
  ) {
    throw new Error("invalid_task_id");
  }
  return { p, v, t, f, l };
}

/**
 * Decode an opaque task id back into its descriptor.
 *
 * @param id - A task id produced by {@link encodeTaskId}.
 * @returns The decoded task descriptor.
 * @throws {Error} `invalid_task_id` when the id is malformed or tampered with.
 */
export function decodeTaskId(id: string): TaskDescriptor {
  let parsed: unknown;
  try {
    const json = new TextDecoder().decode(fromBase64Url(id));
    parsed = JSON.parse(json) as unknown;
  } catch {
    throw new Error("invalid_task_id");
  }
  const compact = asCompactTask(parsed);
  return {
    partNumber: compact.p,
    variant: compact.v,
    taskType: compact.t,
    field: compact.f,
    lang: compact.l,
  };
}
