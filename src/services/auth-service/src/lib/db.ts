import type { Result } from "@emul8/types";
import type { QueryResult } from "pg";
import { DatabaseError, Pool } from "pg";

import { env } from "../env";

const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 3 * 1000,
});

type DbError =
  | "unique_violation"
  | "foreign_key_violation"
  | "not_null_violation"
  | "unknown_error";

async function execute(
  query: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params?: any[],
): Promise<Result<QueryResult, DbError>> {
  try {
    const result = await pool.query(query, params);
    return [result, null];
  } catch (err: unknown) {
    console.error("Failed to execute database query:", err);
    if (err instanceof DatabaseError) {
      switch (err.code) {
        case "23505":
          return [null, "unique_violation" as const];
        case "23503":
          return [null, "foreign_key_violation" as const];
        case "23502":
          return [null, "not_null_violation" as const];
      }
    }
    return [null, "unknown_error" as const];
  }
}

export const db = { execute };
