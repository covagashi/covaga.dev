import { env, applyD1Migrations, type D1Migration } from "cloudflare:test";
import { describe, it, expect, beforeAll } from "vitest";
import type { Env } from "../src/env.js";
import {
  getArticleContext,
  getMetrics,
  listTasks,
  startEpisode,
  submitProposal,
} from "../src/services/gym.service.js";

const testEnv = env as Env & { TEST_MIGRATIONS: D1Migration[] };

const TENANT_A = "t_gym_a";
const TENANT_B = "t_gym_b";

/** Insert an article row directly, serialising `data` to JSON. */
async function seedArticle(
  tenantId: string,
  partNumber: string,
  description: string,
  data: Record<string, unknown>,
): Promise<void> {
  await testEnv.DB.prepare(
    `INSERT INTO articles
       (tenant_id, part_number, variant, manufacturer, description, data, snapshot_id, updated_at)
     VALUES (?, ?, '', ?, ?, ?, 's1', ?)`,
  )
    .bind(
      tenantId,
      partNumber,
      typeof data["manufacturer"] === "string" ? data["manufacturer"] : "",
      description,
      JSON.stringify(data),
      Date.now(),
    )
    .run();
}

beforeAll(async () => {
  await applyD1Migrations(testEnv.DB, testEnv.TEST_MIGRATIONS);

  // Article A1: has es/en/de translations, missing fr_FR -> one translate task.
  await seedArticle(TENANT_A, "A1", "Cable 2,5 mm²", {
    manufacturer: "ACME",
    productGroup: "Cable",
    description: "Cable 2,5 mm²",
    description_i18n: {
      es_ES: "Cable 2,5 mm²",
      en_US: "Cable 2.5 mm2",
      de_DE: "Kabel 2,5 mm²",
    },
  });

  // Article A2: empty description -> one describe task.
  await seedArticle(TENANT_A, "A2", "", {
    manufacturer: "ACME",
    productGroup: "Circuit Breaker",
    description: "",
    description_i18n: {},
  });

  // Article B1 (other tenant), empty description -> describe task for B only.
  await seedArticle(TENANT_B, "B1", "", {
    manufacturer: "OtherCo",
    productGroup: "Relay",
    description: "",
    description_i18n: {},
  });
});

describe("gym.service", () => {
  it("derives the right tasks from article text gaps", async () => {
    const tasks = await listTasks(testEnv, TENANT_A, {});
    const byPart = new Map(tasks.map((t) => [`${t.part_number}:${t.task_type}:${t.lang}`, t]));
    expect(byPart.has("A1:translate:fr_FR")).toBe(true);
    expect(byPart.has("A2:describe:")).toBe(true);
    // A1 only misses fr_FR, so exactly one translate task for it.
    const a1Translate = tasks.filter((t) => t.part_number === "A1");
    expect(a1Translate).toHaveLength(1);
    expect(a1Translate[0]?.lang).toBe("fr_FR");
  });

  it("respects the type filter", async () => {
    const only = await listTasks(testEnv, TENANT_A, { types: ["describe"] });
    expect(only.every((t) => t.task_type === "describe")).toBe(true);
    expect(only.some((t) => t.part_number === "A2")).toBe(true);
  });

  it("returns read-only article context with missing languages", async () => {
    const ctx = await getArticleContext(testEnv, TENANT_A, "A1");
    expect(ctx?.product_group).toBe("Cable");
    expect(ctx?.missing_langs).toEqual(["fr_FR"]);
    const missing = await getArticleContext(testEnv, TENANT_A, "does-not-exist");
    expect(missing).toBeUndefined();
  });

  it("stores a validated translation and removes it from the task list", async () => {
    const episodeId = await startEpisode(testEnv, TENANT_A);
    const tasks = await listTasks(testEnv, TENANT_A, { types: ["translate"] });
    const task = tasks.find((t) => t.part_number === "A1");
    expect(task).toBeDefined();

    const result = await submitProposal(testEnv, TENANT_A, {
      task_id: task!.task_id,
      value: "Câble 2,5 mm²",
      confidence: 0.9,
      episode_id: episodeId,
    });
    expect(result.accepted).toBe(true);
    expect(result.status).toBe("validated");
    expect(result.proposal_id).toBeDefined();

    // The stored row exists and is validated.
    const row = await testEnv.DB.prepare(
      `SELECT new_value, status, confidence FROM gym_proposals
         WHERE tenant_id = ? AND part_number = 'A1' AND lang = 'fr_FR'`,
    )
      .bind(TENANT_A)
      .first<{ new_value: string; status: string; confidence: number }>();
    expect(row?.status).toBe("validated");
    expect(row?.new_value).toBe("Câble 2,5 mm²");

    // The A1 translate task no longer appears.
    const after = await listTasks(testEnv, TENANT_A, { types: ["translate"] });
    expect(after.some((t) => t.part_number === "A1")).toBe(false);

    // articles table is untouched (overlay only).
    const article = await testEnv.DB.prepare(
      "SELECT description FROM articles WHERE tenant_id = ? AND part_number = 'A1'",
    )
      .bind(TENANT_A)
      .first<{ description: string }>();
    expect(article?.description).toBe("Cable 2,5 mm²");
  });

  it("rejects an invalid proposal and stores nothing", async () => {
    const episodeId = await startEpisode(testEnv, TENANT_A);
    const tasks = await listTasks(testEnv, TENANT_A, { types: ["describe"] });
    const task = tasks.find((t) => t.part_number === "A2");
    expect(task).toBeDefined();

    const before = await testEnv.DB.prepare(
      "SELECT COUNT(*) AS c FROM gym_proposals WHERE tenant_id = ? AND part_number = 'A2'",
    )
      .bind(TENANT_A)
      .first<{ c: number }>();

    const result = await submitProposal(testEnv, TENANT_A, {
      task_id: task!.task_id,
      value: "",
      episode_id: episodeId,
    });
    expect(result.accepted).toBe(false);
    expect(result.status).toBe("rejected");

    const after = await testEnv.DB.prepare(
      "SELECT COUNT(*) AS c FROM gym_proposals WHERE tenant_id = ? AND part_number = 'A2'",
    )
      .bind(TENANT_A)
      .first<{ c: number }>();
    expect(after?.c).toBe(before?.c);

    // Metrics for this episode: one submitted, zero validated, one rejected.
    const metrics = await getMetrics(testEnv, TENANT_A, episodeId);
    expect(metrics.submitted).toBe(1);
    expect(metrics.validated).toBe(0);
    expect(metrics.rejected).toBe(1);
    expect(metrics.success_rate).toBe(0);
  });

  it("aggregates tenant-wide metrics across episodes", async () => {
    // Storage is isolated per test, so build up the episodes here: one valid
    // translation and one rejected description, then aggregate tenant-wide.
    const ep1 = await startEpisode(testEnv, TENANT_A);
    const translate = (await listTasks(testEnv, TENANT_A, { types: ["translate"] })).find(
      (t) => t.part_number === "A1",
    );
    await submitProposal(testEnv, TENANT_A, {
      task_id: translate!.task_id,
      value: "Câble 2,5 mm²",
      episode_id: ep1,
    });

    const ep2 = await startEpisode(testEnv, TENANT_A);
    const describe = (await listTasks(testEnv, TENANT_A, { types: ["describe"] })).find(
      (t) => t.part_number === "A2",
    );
    await submitProposal(testEnv, TENANT_A, {
      task_id: describe!.task_id,
      value: "",
      episode_id: ep2,
    });

    const metrics = await getMetrics(testEnv, TENANT_A);
    expect(metrics.submitted).toBe(2);
    expect(metrics.validated).toBe(1);
    expect(metrics.rejected).toBe(1);
    expect(metrics.success_rate).toBeCloseTo(0.5, 5);
    // A1's fr_FR is now closed; A2's describe remains open.
    expect(metrics.remaining_by_type.translate).toBe(0);
    expect(metrics.remaining_by_type.describe).toBe(1);
  });

  it("throws 404 when submitting against a missing article", async () => {
    // A valid task id for a non-existent part.
    const tasks = await listTasks(testEnv, TENANT_A, { types: ["describe"] });
    const task = tasks.find((t) => t.part_number === "A2");
    // Submit A2's describe task as tenant B (which does not own A2).
    await expect(
      submitProposal(testEnv, TENANT_B, {
        task_id: task!.task_id,
        value: "A perfectly reasonable relay description for DIN rail mounting.",
      }),
    ).rejects.toMatchObject({ status: 404 });
  });

  it("isolates tenants: A's tasks never include B's articles", async () => {
    const tasksA = await listTasks(testEnv, TENANT_A, {});
    expect(tasksA.some((t) => t.part_number === "B1")).toBe(false);

    const tasksB = await listTasks(testEnv, TENANT_B, {});
    expect(tasksB.every((t) => t.part_number === "B1")).toBe(true);
    expect(tasksB).toHaveLength(1);
  });

  it("throws 400 on a malformed task id", async () => {
    await expect(
      submitProposal(testEnv, TENANT_A, {
        task_id: "!!!bad!!!",
        value: "whatever",
      }),
    ).rejects.toMatchObject({ status: 400 });
  });
});
