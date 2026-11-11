import { Pool, type PoolClient, type QueryResultRow } from "@neondatabase/serverless";

let pool: Pool | null = null;

function databaseUrl(): string {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) throw new Error("DATABASE_URL is required to use the Neon database adapter");
  return url;
}

export function shouldUsePostgres(): boolean {
  return process.env.NODE_ENV !== "test" && process.env.HYFE_DB_ADAPTER !== "local" && Boolean(process.env.DATABASE_URL?.trim());
}

function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: databaseUrl(),
    });
  }
  return pool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(sql: string, values: unknown[] = []): Promise<T[]> {
  const result = await getPool().query<T>(sql, values);
  return result.rows;
}

export async function transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const value = await callback(client);
    await client.query("COMMIT");
    return value;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
