import path from "node:path";
import {
  defineWorkersProject,
  readD1Migrations,
} from "@cloudflare/vitest-pool-workers/config";

/**
 * Vitest configuration running tests inside the workerd runtime via the
 * Cloudflare workers pool, so D1 (the `DB` binding) is available. The SQL
 * migrations are read at config time and exposed as the `TEST_MIGRATIONS`
 * binding; tests apply them with `applyD1Migrations`.
 */
export default defineWorkersProject(async () => {
  const migrations = await readD1Migrations(
    path.join(__dirname, "migrations"),
  );

  return {
    test: {
      poolOptions: {
        workers: {
          singleWorker: true,
          wrangler: { configPath: "./wrangler.jsonc" },
          miniflare: {
            bindings: { TEST_MIGRATIONS: migrations },
          },
        },
      },
    },
  };
});
