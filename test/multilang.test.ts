import { describe, it, expect } from "vitest";
import { parseMultilang, enrichPart } from "../src/lib/multilang.js";

describe("parseMultilang", () => {
  it("parses es/en/de plus an unknown ??_?? language", () => {
    const result = parseMultilang(
      "es_ES@Hola;en_US@Hello;de_DE@Hallo;??_??@X",
    );
    expect(result.i18n).toEqual({
      es_ES: "Hola",
      en_US: "Hello",
      de_DE: "Hallo",
      "??_??": "X",
    });
    expect(result.preferred).toBe("Hola");
  });

  it("returns the raw value for a plain string without '@'", () => {
    expect(parseMultilang("just text")).toEqual({
      i18n: {},
      preferred: "just text",
    });
  });

  it("returns empty i18n and empty preferred for empty input", () => {
    expect(parseMultilang("")).toEqual({ i18n: {}, preferred: "" });
  });

  it("honours preference order, picking en_US when es_ES is absent", () => {
    const result = parseMultilang("de_DE@Hallo;en_US@Hello");
    expect(result.preferred).toBe("Hello");
  });

  it("falls back to the first inserted value when no preferred lang is present", () => {
    const result = parseMultilang("fr_FR@Bonjour;it_IT@Ciao");
    expect(result.preferred).toBe("Bonjour");
  });
});

describe("enrichPart", () => {
  it("parses a multi-language description into preferred + i18n + raw", () => {
    const part = enrichPart({
      part_number: "P1",
      description: "es_ES@Hola;en_US@Hello",
    });
    expect(part["description"]).toBe("Hola");
    expect(part["description_raw"]).toBe("es_ES@Hola;en_US@Hello");
    expect(part["description_i18n"]).toEqual({ es_ES: "Hola", en_US: "Hello" });
  });

  it("handles a plain description with no languages", () => {
    const part = enrichPart({ part_number: "P2", description: "plain" });
    expect(part["description"]).toBe("plain");
    expect(part["description_raw"]).toBe("plain");
    expect(part["description_i18n"]).toEqual({});
  });

  it("defaults a missing description to an empty string", () => {
    const part = enrichPart({ part_number: "P3" });
    expect(part["description"]).toBe("");
    expect(part["description_raw"]).toBe("");
    expect(part["description_i18n"]).toEqual({});
  });

  it("is idempotent when applied twice", () => {
    const once = enrichPart({
      part_number: "P4",
      description: "es_ES@Hola;en_US@Hello",
    });
    const twice = enrichPart(once);
    expect(twice["description"]).toBe("Hola");
    expect(twice["description_raw"]).toBe("es_ES@Hola;en_US@Hello");
    expect(twice["description_i18n"]).toEqual({ es_ES: "Hola", en_US: "Hello" });
  });
});
