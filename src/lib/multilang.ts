/**
 * Parsing of multi-language description fields as produced by the EPLAN
 * article database. A raw value looks like
 * `es_ES@Hola;en_US@Hello;de_DE@Hallo`, one `lang@text` segment per
 * language separated by `;`. Pure logic, no I/O.
 */

/** Matches a single `xx_XX@text` segment; `?` is a valid placeholder char. */
const ML_LANG_RE = /^([a-z?]{2}_[A-Z?]{2})@(.*)$/s;

/** Language codes chosen, in order, when picking the preferred text. */
const ML_PREFERRED = ["es_ES", "en_US", "de_DE"] as const;

/** Result of parsing a multi-language string. */
export interface MultilangResult {
  /** Language code to text, one entry per parsed segment. */
  i18n: Record<string, string>;
  /** Preferred text: first available preferred language, else first parsed. */
  preferred: string;
}

/**
 * Parse a raw multi-language string into its per-language map and a single
 * preferred value.
 *
 * @param raw - Raw field value, possibly containing `lang@text` segments.
 * @returns The parsed `i18n` map and the `preferred` text.
 */
export function parseMultilang(raw: string): MultilangResult {
  if (raw.length === 0 || !raw.includes("@")) {
    return { i18n: {}, preferred: raw };
  }

  const i18n: Record<string, string> = {};
  for (const segment of raw.split(";")) {
    const match = ML_LANG_RE.exec(segment.trim());
    if (!match) {
      continue;
    }
    const lang = match[1];
    const value = match[2];
    if (lang !== undefined && value !== undefined && value.length > 0) {
      i18n[lang] = value;
    }
  }

  const values = Object.values(i18n);
  if (values.length === 0) {
    return { i18n: {}, preferred: raw };
  }

  let preferred: string = values[0] ?? raw;
  for (const lang of ML_PREFERRED) {
    const value = i18n[lang];
    if (value !== undefined) {
      preferred = value;
      break;
    }
  }

  return { i18n, preferred };
}

/**
 * Enrich a part in place by parsing its `description` field. Idempotent: a
 * part that already carries `description_raw` is returned unchanged. Adds
 * `description_raw` (original), rewrites `description` to the preferred text,
 * and adds `description_i18n` (the per-language map).
 *
 * @param part - Part object to enrich (mutated and returned).
 * @returns The same object, enriched.
 */
export function enrichPart(
  part: Record<string, unknown>,
): Record<string, unknown> {
  if ("description_raw" in part) {
    return part;
  }

  const value = part["description"];
  const raw = typeof value === "string" ? value : "";
  const { i18n, preferred } = parseMultilang(raw);

  part["description_raw"] = raw;
  part["description"] = preferred;
  part["description_i18n"] = i18n;
  return part;
}
