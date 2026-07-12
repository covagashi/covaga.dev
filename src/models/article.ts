/**
 * An enriched article (part) stored for a tenant, unique per
 * `(tenantId, partNumber, variant)`.
 */
export interface Article {
  /** Owning tenant id. */
  tenantId: string;
  /** Manufacturer part number. */
  partNumber: string;
  /** Variant discriminator; empty string when the part has no variant. */
  variant: string;
  /** Manufacturer name. */
  manufacturer?: string;
  /** Preferred (single-language) description. */
  description?: string;
  /** Full enriched part object serialised as JSON. */
  data: string;
  /** Snapshot id that last wrote this row. */
  snapshotId: string;
  /** Last write timestamp in epoch milliseconds. */
  updatedAt: number;
}

/** Column values required to UPSERT one article row. */
export interface ArticleUpsert {
  /** Owning tenant id. */
  tenantId: string;
  /** Manufacturer part number. */
  partNumber: string;
  /** Variant discriminator; empty string when the part has no variant. */
  variant: string;
  /** Manufacturer name (empty string when absent). */
  manufacturer: string;
  /** Preferred description (empty string when absent). */
  description: string;
  /** Full enriched part object serialised as JSON. */
  data: string;
  /** Snapshot id stamping this write. */
  snapshotId: string;
  /** Write timestamp in epoch milliseconds. */
  updatedAt: number;
}
