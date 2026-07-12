import { describe, it, expect } from "vitest";
import {
  type TaskDescriptor,
  decodeTaskId,
  encodeTaskId,
} from "../src/lib/task-id.js";

describe("task-id", () => {
  it("round-trips a translate task", () => {
    const task: TaskDescriptor = {
      partNumber: "3RV2011-1AA10",
      variant: "A",
      taskType: "translate",
      field: "description",
      lang: "fr_FR",
    };
    expect(decodeTaskId(encodeTaskId(task))).toEqual(task);
  });

  it("round-trips a describe task with empty variant and lang", () => {
    const task: TaskDescriptor = {
      partNumber: "P-100",
      variant: "",
      taskType: "describe",
      field: "description",
      lang: "",
    };
    expect(decodeTaskId(encodeTaskId(task))).toEqual(task);
  });

  it("round-trips part numbers with non-ASCII characters", () => {
    const task: TaskDescriptor = {
      partNumber: "Câble-Ω-µ",
      variant: "Ünvariant",
      taskType: "translate",
      field: "description",
      lang: "de_DE",
    };
    expect(decodeTaskId(encodeTaskId(task))).toEqual(task);
  });

  it("produces a URL-safe id (no +, / or = padding)", () => {
    const id = encodeTaskId({
      partNumber: "x".repeat(40),
      variant: "y".repeat(10),
      taskType: "translate",
      field: "description",
      lang: "en_US",
    });
    expect(id).not.toMatch(/[+/=]/);
  });

  it("throws on a tampered / non-base64url id", () => {
    expect(() => decodeTaskId("!!!not-valid!!!")).toThrow("invalid_task_id");
  });

  it("throws when the payload decodes to a non-object", () => {
    const id = encodeTaskId({
      partNumber: "P1",
      variant: "",
      taskType: "describe",
      field: "description",
      lang: "",
    });
    // Flip the middle of the id to corrupt the payload structure.
    const tampered = `${id.slice(0, 2)}zz${id.slice(4)}`;
    expect(() => decodeTaskId(tampered)).toThrow("invalid_task_id");
  });

  it("throws when the task type is not one of the allowed values", () => {
    // Manually craft a base64url payload with an invalid task type.
    const json = JSON.stringify({
      p: "P1",
      v: "",
      t: "bogus",
      f: "description",
      l: "",
    });
    const bytes = new TextEncoder().encode(json);
    let binary = "";
    for (const b of bytes) {
      binary += String.fromCharCode(b);
    }
    const id = btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    expect(() => decodeTaskId(id)).toThrow("invalid_task_id");
  });
});
