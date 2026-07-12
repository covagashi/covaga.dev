import type { Env } from "../env.js";
import type { Article, ArticleUpsert } from "../models/article.js";

/** Max number of statements per `env.DB.batch(...)` call (D1 limit safety). */
const BATCH_CHUNK_SIZE = 50;

/** UPSERT keyed on the article primary key; refreshes all mutable columns. */
const UPSERT_SQL = `INSERT INTO articles
    (tenant_id, part_number, variant, manufacturer, description, data, snapshot_id, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT (tenant_id, part_number, variant) DO UPDATE SET
    manufacturer = excluded.manufacturer,
    description  = excluded.description,
    data         = excluded.data,
    snapshot_id  = excluded.snapshot_id,
    updated_at   = excluded.updated_at`;

/**
 * UPSERT a set of article rows using D1 batched writes, chunked to at most
 * `chunkSize` statements per `batch(...)` call to stay within D1 limits.
 *
 * @param env - Worker environment holding the D1 binding.
 * @param rows - Article column values to write.
 * @param chunkSize - Statements per batch call (defaults to 50).
 */
export async function upsertArticles(
  env: Env,
  rows: readonly ArticleUpsert[],
  chunkSize: number = BATCH_CHUNK_SIZE,
): Promise<void> {
  if (rows.length === 0) {
    return;
  }

  const statement = env.DB.prepare(UPSERT_SQL);
  const bound = rows.map((row) =>
    statement.bind(
      row.tenantId,
      row.partNumber,
      row.variant,
      row.manufacturer,
      row.description,
      row.data,
      row.snapshotId,
      row.updatedAt,
    ),
  );

  for (let i = 0; i < bound.length; i += chunkSize) {
    await env.DB.batch(bound.slice(i, i + chunkSize));
  }
}

/**
 * Delete a tenant's articles that do not belong to the given snapshot,
 * removing parts absent from the latest upload.
 *
 * @param env - Worker environment holding the D1 binding.
 * @param tenantId - Owning tenant id.
 * @param snapshotId - Snapshot id whose rows are kept.
 */
export async function deleteStaleArticles(
  env: Env,
  tenantId: string,
  snapshotId: string,
): Promise<void> {
  await env.DB.prepare(
    "DELETE FROM articles WHERE tenant_id = ? AND snapshot_id != ?",
  )
    .bind(tenantId, snapshotId)
    .run();
}

/** Shape of a selectable row from the `articles` table. */
interface ArticleRow {
  part_number: string;
  variant: string;
  manufacturer: string;
  description: string;
  data: string;
  snapshot_id: string;
  updated_at: number;
}

/** Map a raw D1 row to the `Article` model. */
function toArticle(tenantId: string, row: ArticleRow): Article {
  return {
    tenantId,
    partNumber: row.part_number,
    variant: row.variant,
    manufacturer: row.manufacturer,
    description: row.description,
    data: row.data,
    snapshotId: row.snapshot_id,
    updatedAt: row.updated_at,
  };
}

/**
 * Columns selected for read queries. The optional text columns are coalesced
 * to '' in SQL so the mapped model never carries a missing text value.
 */
const ARTICLE_COLUMNS =
  "part_number, variant, COALESCE(manufacturer, '') AS manufacturer, " +
  "COALESCE(description, '') AS description, data, snapshot_id, updated_at";

/**
 * Read a single article by its natural key.
 *
 * @param env - Worker environment holding the D1 binding.
 * @param tenantId - Owning tenant id.
 * @param partNumber - Manufacturer part number.
 * @param variant - Variant discriminator ('' when none).
 * @returns The article, or `undefined` when absent.
 */
export async function findArticleForTenant(
  env: Env,
  tenantId: string,
  partNumber: string,
  variant: string,
): Promise<Article | undefined> {
  const row = await env.DB.prepare(
    `SELECT ${ARTICLE_COLUMNS} FROM articles
       WHERE tenant_id = ? AND part_number = ? AND variant = ?`,
  )
    .bind(tenantId, partNumber, variant)
    .first<ArticleRow>();
  return row ? toArticle(tenantId, row) : undefined;
}

/**
 * List a tenant's articles, most-recently-updated first, capped at `limit`.
 *
 * @param env - Worker environment holding the D1 binding.
 * @param tenantId - Owning tenant id.
 * @param limit - Maximum number of rows to return.
 * @returns The tenant's articles (up to `limit`).
 */
export async function listArticlesByTenant(
  env: Env,
  tenantId: string,
  limit: number,
): Promise<Article[]> {
  const result = await env.DB.prepare(
    `SELECT ${ARTICLE_COLUMNS} FROM articles
       WHERE tenant_id = ?
       ORDER BY updated_at DESC, part_number ASC, variant ASC
       LIMIT ?`,
  )
    .bind(tenantId, limit)
    .all<ArticleRow>();
  return result.results.map((row) => toArticle(tenantId, row));
}

/**
 * Count all articles owned by a tenant.
 *
 * @param env - Worker environment holding the D1 binding.
 * @param tenantId - Owning tenant id.
 * @returns The number of article rows for the tenant.
 */
export async function countArticlesByTenant(
  env: Env,
  tenantId: string,
): Promise<number> {
  const row = await env.DB.prepare(
    "SELECT COUNT(*) AS count FROM articles WHERE tenant_id = ?",
  )
    .bind(tenantId)
    .first<{ count: number }>();
  return row?.count ?? 0;
}
