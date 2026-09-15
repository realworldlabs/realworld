import fs from "node:fs";
import { sql } from "drizzle-orm";
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
  // Assets indexed before opening prices were recorded get one from their current state (exact while unmoved).
  await db.execute(sql`
    insert into asset_price (id, asset_id, tick, price_usd, sources_hash, timestamp, tx_hash)
    select 'open-' || a.asset_id, a.asset_id, a.tick, a.price_usd, '0x0000000000000000000000000000000000000000000000000000000000000000', a.last_update, ''
    from asset a where not exists (select 1 from asset_price p where p.asset_id = a.asset_id)`);
  return db;
}
