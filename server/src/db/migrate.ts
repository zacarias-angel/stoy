import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mysql, { type RowDataPacket } from 'mysql2/promise';
import { env } from '../config/env.js';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.resolve(currentDir, '../../sql');

async function run(): Promise<void> {
  const connection = await mysql.createConnection({
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    multipleStatements: true,
  });

  try {
    await connection.query(
      `CREATE TABLE IF NOT EXISTS schema_migrations (
         id VARCHAR(255) NOT NULL,
         applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
         PRIMARY KEY (id)
       ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
    );

    const [rows] = await connection.query<RowDataPacket[]>(
      'SELECT id FROM schema_migrations'
    );
    const applied = new Set(rows.map((row) => String(row.id)));

    const files = (await readdir(migrationsDir))
      .filter((file) => file.endsWith('.sql'))
      .sort();

    for (const file of files) {
      if (applied.has(file)) {
        console.log(`= ${file} (ya aplicada)`);
        continue;
      }

      const sql = await readFile(path.join(migrationsDir, file), 'utf8');
      console.log(`+ aplicando ${file}...`);
      await connection.query(sql);
      await connection.query('INSERT INTO schema_migrations (id) VALUES (?)', [file]);
    }

    console.log('Migraciones al dia.');
  } finally {
    await connection.end();
  }
}

run().catch((error: unknown) => {
  console.error('Error al ejecutar migraciones:', error);
  process.exit(1);
});
