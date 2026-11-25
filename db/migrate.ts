import fs from 'node:fs';
import path from 'node:path';
import { db } from '../server/db';

async function migrate() {
  const schemaPath = path.resolve(process.cwd(), 'db/schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf-8');
  await db.executeMultiple(sql);
  console.log('Turso schema migration applied successfully.');
}

migrate()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
