import { serve } from "@hono/node-server";
import { createApi } from "./api.ts";
import { config, deploymentsFile } from "./config.ts";
import { openDb } from "./db.ts";
import { runSync } from "./sync.ts";

const log = (message: string, extra: Record<string, unknown> = {}) =>
  console.log(JSON.stringify({ t: new Date().toISOString(), message, ...extra }));

const db = await openDb();
log("indexer started", { deployments: deploymentsFile, database: config.databaseUrl ? "postgres" : "pglite", port: config.port });

serve({ fetch: createApi(db).fetch, port: config.port, hostname: "0.0.0.0" });

// The API serves whatever has been indexed so far; /ready flips once the backfill reaches the chain head.
runSync(db, log).catch((err) => {
  log("sync crashed", { error: err instanceof Error ? err.stack ?? err.message : String(err) });
  process.exit(1);
});
