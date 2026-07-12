/**
 * Gym service: derives text gaps from a tenant's articles, hands them to an
 * external LLM as tasks, and stores only proposals that pass the deterministic
 * validators. All logic lives here; D1 access is delegated to the
 * repositories. Proposals are overlay-only and never mutate `articles`.
 */
import type { Env } from "../env.js";
import type { Article } from "../models/article.js";
import type {
  ArticleContext,
  Metrics,
  RemainingByType,
  SubmitResult,
  Task,
  TaskType,
} from "../models/gym.js";
import { HttpError } from "../errors.js";
import {
  type ArticleText,
  REQUIRED_LANGS,
  validateDescription,
  validateTranslation,
} from "../lib/validators.js";
import { decodeTaskId, encodeTaskId } from "../lib/task-id.js";
import {
  findArticleForTenant,
  listArticlesByTenant,
} from "../repositories/article.repository.js";
import {
  aggregateEpisodeCounts,
  bumpEpisodeCounts,
  findEpisodeCounts,
  findProposalId,
  insertEpisode,
  loadValidatedTaskKeys,
  upsertProposal,
} from "../repositories/gym.repository.js";

/** Default cap on the number of tasks returned by `listTasks`. */
const DEFAULT_TASK_LIMIT = 50;
/** Cap on the number of articles scanned when deriving tasks. */
const ARTICLE_SCAN_CAP = 1000;
/** Length at which a `context_hint` is truncated. */
const HINT_LENGTH = 120;

/** Candidate keys under which a product group label may live in `data`. */
const GROUP_KEYS = ["productGroup", "product_group", "group", "gruppe"];
/** Candidate keys under which a product subgroup label may live in `data`. */
const SUBGROUP_KEYS = [
  "productSubGroup",
  "product_subgroup",
  "subgroup",
  "untergruppe",
];

/** Options accepted by {@link listTasks}. */
export interface ListTasksOptions {
  /** Restrict to these task types; omit for all. */
  types?: TaskType[];
  /** Maximum number of tasks to return. */
  limit?: number;
}

/** Arguments accepted by {@link submitProposal}. */
export interface SubmitArgs {
  /** Opaque task id identifying the target. */
  task_id: string;
  /** Proposed text value. */
  value: string;
  /** Target language; required for translate, ignored for describe. */
  lang?: string;
  /** Model-reported confidence in [0, 1]. */
  confidence?: number;
  /** Episode to attribute this submission to. */
  episode_id?: string;
}

/** Read a string field from a parsed `data` record. */
function stringField(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  return typeof value === "string" ? value : "";
}

/** Read the first present, non-empty string among candidate keys. */
function firstStringField(
  record: Record<string, unknown>,
  keys: readonly string[],
): string {
  for (const key of keys) {
    const value = stringField(record, key);
    if (value.length > 0) {
      return value;
    }
  }
  return "";
}

/** Read the `description_i18n` map from a parsed `data` record. */
function i18nField(record: Record<string, unknown>): Record<string, string> {
  const value = record["description_i18n"];
  if (Object(value) !== value || Array.isArray(value)) {
    return {};
  }
  const out: Record<string, string> = {};
  for (const [lang, text] of Object.entries(value as Record<string, unknown>)) {
    if (typeof text === "string") {
      out[lang] = text;
    }
  }
  return out;
}

/** Parse an article's stored `data` JSON into a plain record (safe on error). */
function parseData(article: Article): Record<string, unknown> {
  try {
    const parsed = JSON.parse(article.data) as unknown;
    if (Object(parsed) === parsed && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    /* fall through to empty record */
  }
  return {};
}

/** Build the pure {@link ArticleText} the validators consume. */
function toArticleText(article: Article): ArticleText {
  const data = parseData(article);
  return {
    description: article.description ?? "",
    descriptionI18n: i18nField(data),
    manufacturer: article.manufacturer ?? "",
    productGroup: firstStringField(data, GROUP_KEYS),
    productSubgroup: firstStringField(data, SUBGROUP_KEYS),
  };
}

/** Languages from {@link REQUIRED_LANGS} missing from an i18n map. */
function missingLangs(i18n: Record<string, string>): string[] {
  return REQUIRED_LANGS.filter((lang) => {
    const value = i18n[lang];
    return value === undefined || value.length === 0;
  });
}

/** The task key used to match against stored validated proposals. */
function taskKey(
  partNumber: string,
  variant: string,
  taskType: TaskType,
  field: string,
  lang: string,
): string {
  return [partNumber, variant, taskType, field, lang].join(" ");
}

/** Derive every open task for one article, excluding closed keys. */
function tasksForArticle(
  article: Article,
  closed: Set<string>,
  wanted: (type: TaskType) => boolean,
): Task[] {
  const text = toArticleText(article);
  const tasks: Task[] = [];

  if (text.description.length === 0) {
    const key = taskKey(article.partNumber, article.variant, "describe", "description", "");
    if (wanted("describe") && !closed.has(key)) {
      const hint = `${text.manufacturer} ${text.productGroup}`.trim();
      tasks.push({
        task_id: encodeTaskId({
          partNumber: article.partNumber,
          variant: article.variant,
          taskType: "describe",
          field: "description",
          lang: "",
        }),
        part_number: article.partNumber,
        variant: article.variant,
        task_type: "describe",
        field: "description",
        lang: "",
        context_hint: hint.length > 0 ? hint : "no description yet",
      });
    }
    return tasks;
  }

  if (!wanted("translate")) {
    return tasks;
  }
  for (const lang of missingLangs(text.descriptionI18n)) {
    const key = taskKey(article.partNumber, article.variant, "translate", "description", lang);
    if (closed.has(key)) {
      continue;
    }
    tasks.push({
      task_id: encodeTaskId({
        partNumber: article.partNumber,
        variant: article.variant,
        taskType: "translate",
        field: "description",
        lang,
      }),
      part_number: article.partNumber,
      variant: article.variant,
      task_type: "translate",
      field: "description",
      lang,
      context_hint: text.description.slice(0, HINT_LENGTH),
    });
  }
  return tasks;
}

/**
 * Start a Gym episode for the tenant.
 *
 * @param env - Worker environment holding the D1 binding.
 * @param tenantId - Owning tenant id.
 * @returns The new episode id.
 */
export async function startEpisode(env: Env, tenantId: string): Promise<string> {
  const id = crypto.randomUUID();
  await insertEpisode(env, { id, tenantId, startedAt: Date.now() });
  return id;
}

/**
 * List open tasks for the tenant, derived from article text gaps and filtered
 * against already-validated proposals.
 *
 * @param env - Worker environment holding the D1 binding.
 * @param tenantId - Owning tenant id.
 * @param opts - Optional type filter and result limit.
 * @returns Up to `limit` open tasks.
 */
export async function listTasks(
  env: Env,
  tenantId: string,
  opts: ListTasksOptions = {},
): Promise<Task[]> {
  const limit = opts.limit ?? DEFAULT_TASK_LIMIT;
  const wanted = (type: TaskType): boolean =>
    opts.types === undefined || opts.types.includes(type);

  const [articles, closed] = await Promise.all([
    listArticlesByTenant(env, tenantId, ARTICLE_SCAN_CAP),
    loadValidatedTaskKeys(env, tenantId),
  ]);

  const tasks: Task[] = [];
  for (const article of articles) {
    for (const task of tasksForArticle(article, closed, wanted)) {
      tasks.push(task);
      if (tasks.length >= limit) {
        return tasks;
      }
    }
  }
  return tasks;
}

/**
 * Read-only article context for the LLM: manufacturer, product group,
 * description, per-language map and the still-missing required languages.
 *
 * @param env - Worker environment holding the D1 binding.
 * @param tenantId - Owning tenant id.
 * @param partNumber - Manufacturer part number.
 * @param variant - Variant discriminator (defaults to '').
 * @returns The context, or `undefined` when the article is unknown.
 */
export async function getArticleContext(
  env: Env,
  tenantId: string,
  partNumber: string,
  variant = "",
): Promise<ArticleContext | undefined> {
  const article = await findArticleForTenant(env, tenantId, partNumber, variant);
  if (article === undefined) {
    return undefined;
  }
  const text = toArticleText(article);
  return {
    part_number: article.partNumber,
    variant: article.variant,
    manufacturer: text.manufacturer,
    product_group: text.productGroup,
    product_subgroup: text.productSubgroup,
    description: text.description,
    description_i18n: text.descriptionI18n,
    missing_langs: missingLangs(text.descriptionI18n),
  };
}

/**
 * Validate and (if it passes) store a proposal. On success the proposal is
 * UPSERTed as `validated`; on failure nothing is stored. Either way the
 * episode counters advance. `articles` is never mutated.
 *
 * @param env - Worker environment holding the D1 binding.
 * @param tenantId - Owning tenant id.
 * @param args - Task id, proposed value and optional metadata.
 * @returns The verdict, report and (when accepted) the stored proposal id.
 * @throws {HttpError} 400 for a malformed task id; 404 for a missing article.
 */
export async function submitProposal(
  env: Env,
  tenantId: string,
  args: SubmitArgs,
): Promise<SubmitResult> {
  let descriptor: ReturnType<typeof decodeTaskId>;
  try {
    descriptor = decodeTaskId(args.task_id);
  } catch {
    throw new HttpError(400, "invalid_task_id");
  }

  const article = await findArticleForTenant(
    env,
    tenantId,
    descriptor.partNumber,
    descriptor.variant,
  );
  if (article === undefined) {
    throw new HttpError(404, "not_found");
  }

  const text = toArticleText(article);
  const episodeId = args.episode_id ?? "";
  const confidence = args.confidence ?? 0;

  let oldValue: string;
  let verdict;
  if (descriptor.taskType === "translate") {
    const lang = args.lang ?? descriptor.lang;
    oldValue = text.descriptionI18n[lang] ?? "";
    verdict = validateTranslation(text, lang, args.value);
    descriptor = { ...descriptor, lang };
  } else {
    oldValue = text.description;
    verdict = validateDescription(text, args.value);
  }

  if (!verdict.ok) {
    await bumpEpisodeCounts(env, tenantId, episodeId, false);
    return { accepted: false, status: "rejected", report: verdict.report };
  }

  const id = crypto.randomUUID();
  await upsertProposal(env, {
    id,
    tenantId,
    partNumber: descriptor.partNumber,
    variant: descriptor.variant,
    taskType: descriptor.taskType,
    field: descriptor.field,
    lang: descriptor.lang,
    oldValue,
    newValue: args.value,
    confidence,
    episodeId,
    validatorReport: verdict.report,
    createdAt: Date.now(),
  });
  await bumpEpisodeCounts(env, tenantId, episodeId, true);

  const proposalId =
    (await findProposalId(
      env,
      tenantId,
      descriptor.partNumber,
      descriptor.variant,
      descriptor.taskType,
      descriptor.field,
      descriptor.lang,
    )) ?? id;

  return {
    accepted: true,
    status: "validated",
    report: verdict.report,
    proposal_id: proposalId,
  };
}

/** Count remaining tasks per type (no limit), for the metrics view. */
async function remainingByType(
  env: Env,
  tenantId: string,
): Promise<RemainingByType> {
  const [articles, closed] = await Promise.all([
    listArticlesByTenant(env, tenantId, ARTICLE_SCAN_CAP),
    loadValidatedTaskKeys(env, tenantId),
  ]);
  const remaining: RemainingByType = { translate: 0, describe: 0 };
  const all = (): boolean => true;
  for (const article of articles) {
    for (const task of tasksForArticle(article, closed, all)) {
      remaining[task.task_type] += 1;
    }
  }
  return remaining;
}

/**
 * Compute Gym metrics. With `episodeId`, counters come from that episode;
 * without, they are aggregated across the tenant's episodes. `remaining_by_type`
 * always reflects the tenant's current open tasks.
 *
 * @param env - Worker environment holding the D1 binding.
 * @param tenantId - Owning tenant id.
 * @param episodeId - Optional episode to scope the counters to.
 * @returns The metrics snapshot.
 */
export async function getMetrics(
  env: Env,
  tenantId: string,
  episodeId?: string,
): Promise<Metrics> {
  const counts =
    episodeId !== undefined && episodeId.length > 0
      ? (await findEpisodeCounts(env, tenantId, episodeId)) ?? {
          submitted: 0,
          validated: 0,
          rejected: 0,
        }
      : await aggregateEpisodeCounts(env, tenantId);

  const remaining = await remainingByType(env, tenantId);
  const successRate =
    counts.submitted > 0 ? counts.validated / counts.submitted : 0;

  return {
    submitted: counts.submitted,
    validated: counts.validated,
    rejected: counts.rejected,
    success_rate: successRate,
    remaining_by_type: remaining,
  };
}
