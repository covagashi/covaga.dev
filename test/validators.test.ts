import { describe, it, expect } from "vitest";
import {
  type ArticleText,
  REQUIRED_LANGS,
  validateDescription,
  validateTranslation,
} from "../src/lib/validators.js";

/** Build an ArticleText with sensible defaults for the fields under test. */
function article(overrides: Partial<ArticleText> = {}): ArticleText {
  return {
    description: "",
    descriptionI18n: {},
    manufacturer: "",
    productGroup: "",
    productSubgroup: "",
    ...overrides,
  };
}

describe("validateTranslation", () => {
  it("passes when numbers and units are preserved", () => {
    const a = article({ description: "Cable 2,5 mm² 400 V, 16 A" });
    const result = validateTranslation(a, "fr_FR", "Câble 2,5 mm² 400 V, 16 A");
    expect(result.ok).toBe(true);
  });

  it("accepts equivalent number/unit spellings (0,5 mm² == 0.5 mm2)", () => {
    const a = article({ description: "Fusible 0,5 mm²" });
    const result = validateTranslation(a, "de_DE", "Sicherung 0.5 mm2");
    expect(result.ok).toBe(true);
  });

  it("fails when a number is changed", () => {
    const a = article({ description: "Relay 24 V coil" });
    const result = validateTranslation(a, "es_ES", "Rele de bobina de 12 V");
    expect(result.ok).toBe(false);
    expect(result.report).toContain("number/unit mismatch");
  });

  it("fails when a unit is dropped", () => {
    const a = article({ description: "Breaker 16 A" });
    const result = validateTranslation(a, "es_ES", "Interruptor de 16");
    expect(result.ok).toBe(false);
    expect(result.report).toContain("number/unit mismatch");
  });

  it("fails when an extra number is introduced", () => {
    const a = article({ description: "Terminal block" });
    const result = validateTranslation(a, "fr_FR", "Bornier 5 pieces");
    expect(result.ok).toBe(false);
    expect(result.report).toContain("number/unit mismatch");
  });

  it("fails on a raw '@' marker", () => {
    const a = article({ description: "Cable 2,5 mm²" });
    const result = validateTranslation(a, "fr_FR", "fr_FR@Câble 2,5 mm²");
    expect(result.ok).toBe(false);
    expect(result.report).toContain("raw '@' marker");
  });

  it("fails on an empty value", () => {
    const a = article({ description: "Cable" });
    const result = validateTranslation(a, "fr_FR", "   ");
    expect(result.ok).toBe(false);
    expect(result.report).toContain("empty");
  });

  it("fails on an unsupported language", () => {
    const a = article({ description: "Cable" });
    const result = validateTranslation(a, "pt_BR", "Cabo");
    expect(result.ok).toBe(false);
    expect(result.report).toContain("unsupported lang");
  });

  it("fails when a value exceeds the max length", () => {
    const a = article({ description: "Cable" });
    const result = validateTranslation(a, "fr_FR", "x".repeat(401));
    expect(result.ok).toBe(false);
    expect(result.report).toContain("out of range");
  });

  it("uses the es_ES/en_US source when preferred description is empty", () => {
    const a = article({
      description: "",
      descriptionI18n: { es_ES: "Contactor 9 A 230 V" },
    });
    const ok = validateTranslation(a, "fr_FR", "Contacteur 9 A 230 V");
    expect(ok.ok).toBe(true);
    const bad = validateTranslation(a, "fr_FR", "Contacteur 9 A");
    expect(bad.ok).toBe(false);
  });

  it("covers every required language", () => {
    const a = article({ description: "Switch 10 A" });
    for (const lang of REQUIRED_LANGS) {
      expect(validateTranslation(a, lang, "Interruptor 10 A").ok).toBe(true);
    }
  });
});

describe("validateDescription", () => {
  it("passes for a substantive, on-topic, marketing-free description", () => {
    const a = article({ productGroup: "Circuit Breaker", manufacturer: "ACME" });
    const result = validateDescription(
      a,
      "Miniature circuit breaker for DIN rail mounting in distribution panels.",
    );
    expect(result.ok).toBe(true);
  });

  it("fails on an empty value", () => {
    const a = article({ productGroup: "Circuit Breaker" });
    const result = validateDescription(a, "");
    expect(result.ok).toBe(false);
    expect(result.report).toContain("empty");
  });

  it("fails when too short", () => {
    const a = article({ productGroup: "Circuit Breaker" });
    const result = validateDescription(a, "Breaker.");
    expect(result.ok).toBe(false);
    expect(result.report).toContain("below minimum");
  });

  it("fails on marketing words (english)", () => {
    const a = article({ productGroup: "Circuit Breaker", manufacturer: "ACME" });
    const result = validateDescription(
      a,
      "The best premium circuit breaker for DIN rail distribution panels.",
    );
    expect(result.ok).toBe(false);
    expect(result.report).toContain("marketing");
  });

  it("fails on marketing words (spanish, accent-insensitive)", () => {
    const a = article({ productGroup: "Interruptor", manufacturer: "ACME" });
    const result = validateDescription(
      a,
      "Interruptor lider del mercado, el mejor para tableros de distribucion.",
    );
    expect(result.ok).toBe(false);
    expect(result.report).toContain("marketing");
  });

  it("fails when it does not mention the product type", () => {
    const a = article({ productGroup: "Circuit Breaker", manufacturer: "Siemens" });
    const result = validateDescription(
      a,
      "A generic widget suitable for many different unrelated purposes.",
    );
    expect(result.ok).toBe(false);
    expect(result.report).toContain("product type");
  });

  it("falls back to a structural heuristic when group/manufacturer are missing", () => {
    const a = article();
    const ok = validateDescription(
      a,
      "Sturdy panel-mounted component with screw terminals.",
    );
    expect(ok.ok).toBe(true);
    // Long enough but fewer than three words -> fails the structural heuristic.
    const tooFewWords = validateDescription(
      a,
      "Widget aaaaaaaaaaaaaaaaaaaaaaaaa",
    );
    expect(tooFewWords.ok).toBe(false);
    expect(tooFewWords.report).toContain("structureless");
  });

  it("matches the product type on the manufacturer token", () => {
    const a = article({ manufacturer: "Phoenix Contact" });
    const result = validateDescription(
      a,
      "Terminal block manufactured by Phoenix for rail-mounted wiring.",
    );
    expect(result.ok).toBe(true);
  });
});
