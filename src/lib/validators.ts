/**
 * Deterministic, dependency-free validators for the Gym. An external LLM
 * proposes text (translations and descriptions); these functions decide
 * whether a proposal is acceptable. All logic is pure so it can be unit
 * tested exhaustively with no I/O.
 */

/** Languages every article is expected to carry a description in, in order. */
export const REQUIRED_LANGS: readonly string[] = [
  "es_ES",
  "en_US",
  "de_DE",
  "fr_FR",
];

/** Minimum acceptable length for a proposed text value. */
const MIN_TRANSLATION_LEN = 2;
/** Maximum acceptable length for a proposed translation. */
const MAX_TRANSLATION_LEN = 400;
/** Minimum acceptable length for a proposed free-form description. */
const MIN_DESCRIPTION_LEN = 20;
/** Minimum length of a token considered "meaningful" for topic matching. */
const MEANINGFUL_TOKEN_LEN = 4;

/**
 * Marketing / superlative words disallowed in descriptions. Stored without
 * diacritics; matching strips accents from the candidate first so `líder`
 * matches `lider`. Case-insensitive.
 */
const MARKETING_BLOCKLIST: readonly string[] = [
  "best",
  "premium",
  "leading",
  "revolutionary",
  "ultimate",
  "superior",
  "unbeatable",
  "worldclass",
  "cuttingedge",
  "mejor",
  "lider",
  "optimo",
  "revolucionario",
  "insuperable",
];

/**
 * Number/unit token matcher. Captures a number (comma or dot decimals) and an
 * optional unit. Units are ordered longest-first so e.g. `mm` is preferred
 * over `m` and `AWG` over `A`.
 */
const NUM_UNIT_RE =
  /(\d+(?:[.,]\d+)?)\s?(mm²|mm2|AWG|kV|Hz|°C|mm|cm|m|A|V|W|%)?/g;

/** Result returned by every validator: a verdict and a human-readable report. */
export interface ValidationResult {
  /** Whether the proposed value passed every rule. */
  ok: boolean;
  /** Explanation of the verdict; lists the specific failures when not ok. */
  report: string;
}

/**
 * Minimal article text the validators reason about. Decoupled from storage so
 * the validators stay pure.
 */
export interface ArticleText {
  /** Preferred single-language description (may be empty). */
  description: string;
  /** Per-language description map (`lang` -> text). */
  descriptionI18n: Record<string, string>;
  /** Manufacturer name (empty when absent). */
  manufacturer: string;
  /** Product group label (empty when absent). */
  productGroup: string;
  /** Product subgroup label (empty when absent). */
  productSubgroup: string;
}

/** Remove diacritics and lowercase, for accent-insensitive comparisons. */
function fold(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

/** Canonicalise a unit so equivalent spellings compare equal (`mm2` = `mm²`). */
function canonicalUnit(unit: string): string {
  return unit === "mm2" ? "mm²" : unit;
}

/**
 * Extract the multiset of number/unit tokens from a text, canonicalised so
 * `0,50 mm²` and `0.5 mm2` yield the same token. Returned sorted for a stable,
 * order-independent comparison.
 */
function numericTokens(text: string): string[] {
  const tokens: string[] = [];
  for (const match of text.matchAll(NUM_UNIT_RE)) {
    const rawNumber = match[1];
    if (rawNumber === undefined) {
      continue;
    }
    const parsed = Number(rawNumber.replace(",", "."));
    const numberPart = Number.isNaN(parsed) ? rawNumber : String(parsed);
    const unitPart = match[2] === undefined ? "" : canonicalUnit(match[2]);
    tokens.push(numberPart + unitPart);
  }
  return tokens.sort();
}

/** Pick the source text a translation is checked against. */
function translationSource(article: ArticleText): string {
  if (article.description.length > 0) {
    return article.description;
  }
  return article.descriptionI18n["es_ES"] ?? article.descriptionI18n["en_US"] ?? "";
}

/**
 * Validate a proposed translation of an article's description into `lang`.
 *
 * Rules (all must hold):
 * 1. `lang` is one of the required languages.
 * 2. The value is non-empty and its length is within `[2, 400]`.
 * 3. The value carries no raw `@` markers (leaked multilang segments).
 * 4. Its number/unit tokens exactly match those of the source description,
 *    so quantities and units are neither dropped, added nor altered.
 *
 * @param article - Article text providing the translation source.
 * @param lang - Target language code (e.g. `fr_FR`).
 * @param value - Proposed translation.
 * @returns The verdict and a report explaining the failures.
 */
export function validateTranslation(
  article: ArticleText,
  lang: string,
  value: string,
): ValidationResult {
  const failures: string[] = [];

  if (!REQUIRED_LANGS.includes(lang)) {
    failures.push(`unsupported lang '${lang}'`);
  }

  const trimmed = value.trim();
  if (trimmed.length === 0) {
    failures.push("value is empty");
  } else if (
    value.length < MIN_TRANSLATION_LEN ||
    value.length > MAX_TRANSLATION_LEN
  ) {
    failures.push(
      `length ${String(value.length)} out of range ` +
        `[${String(MIN_TRANSLATION_LEN)}, ${String(MAX_TRANSLATION_LEN)}]`,
    );
  }

  if (value.includes("@")) {
    failures.push("contains a raw '@' marker");
  }

  const source = translationSource(article);
  const sourceTokens = numericTokens(source);
  const valueTokens = numericTokens(value);
  if (sourceTokens.join("|") !== valueTokens.join("|")) {
    failures.push(
      `number/unit mismatch: source [${sourceTokens.join(", ")}] ` +
        `vs value [${valueTokens.join(", ")}]`,
    );
  }

  return failures.length === 0
    ? { ok: true, report: "translation ok" }
    : { ok: false, report: failures.join("; ") };
}

/** Collect meaningful (length >= 4) folded tokens from a text. */
function meaningfulTokens(text: string): Set<string> {
  const tokens = new Set<string>();
  for (const raw of fold(text).split(/[^a-z0-9]+/)) {
    if (raw.length >= MEANINGFUL_TOKEN_LEN) {
      tokens.add(raw);
    }
  }
  return tokens;
}

/**
 * Validate a proposed free-form description for an article.
 *
 * Rules (all must hold):
 * 1. The value is non-empty and at least `MIN_DESCRIPTION_LEN` characters.
 * 2. It mentions the product type: it shares a meaningful token with the
 *    article's product group, subgroup or manufacturer. When none of those
 *    reference fields is present the check falls back to a structural
 *    heuristic (at least three words), so a missing group can never make a
 *    valid description impossible.
 * 3. It contains no marketing / superlative words from the blocklist.
 *
 * @param article - Article text providing group/manufacturer context.
 * @param value - Proposed description.
 * @returns The verdict and a report explaining the failures.
 */
export function validateDescription(
  article: ArticleText,
  value: string,
): ValidationResult {
  const failures: string[] = [];

  const trimmed = value.trim();
  if (trimmed.length === 0) {
    failures.push("value is empty");
  } else if (trimmed.length < MIN_DESCRIPTION_LEN) {
    failures.push(
      `length ${String(trimmed.length)} below minimum ` +
        String(MIN_DESCRIPTION_LEN),
    );
  }

  const reference = meaningfulTokens(
    `${article.productGroup} ${article.productSubgroup} ${article.manufacturer}`,
  );
  const valueTokens = meaningfulTokens(value);
  if (reference.size > 0) {
    const shares = [...reference].some((token) => valueTokens.has(token));
    if (!shares) {
      failures.push("does not mention the product type (group/manufacturer)");
    }
  } else {
    const words = trimmed.split(/\s+/).filter((word) => word.length > 0);
    if (words.length < 3) {
      failures.push("too short/structureless to describe the product");
    }
  }

  const folded = fold(value);
  const hits = MARKETING_BLOCKLIST.filter((word) => {
    const pattern = new RegExp(`(?:^|[^a-z0-9])${word}(?:[^a-z0-9]|$)`);
    return pattern.test(folded);
  });
  if (hits.length > 0) {
    failures.push(`contains marketing words: ${hits.join(", ")}`);
  }

  return failures.length === 0
    ? { ok: true, report: "description ok" }
    : { ok: false, report: failures.join("; ") };
}
