import fs from "node:fs";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import type { PgDatabase } from "drizzle-orm/pg-core";
import { PGlite } from "@electric-sql/pglite";
import pg from "pg";
import { config } from "./config.ts";
import * as schema from "./schema.ts";

export type Db = PgDatabase<any, typeof schema>;

export async function openDb(): Promise<Db> {
  let db: Db;
  if (config.databaseUrl) {
    const pool = new pg.Pool({ connectionString: config.databaseUrl, max: 8 });
    db = drizzlePg(pool, { schema }) as unknown as Db;
  } else {
    fs.mkdirSync(config.pgliteDir, { recursive: true });
    db = drizzlePglite(new PGlite(config.pgliteDir), { schema }) as unknown as Db;
  }
  for (const stmt of schema.DDL) await db.execute(stmt);
  return db;
}
