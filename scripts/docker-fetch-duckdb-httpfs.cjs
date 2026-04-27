/**
 * При сборке Docker-образа: INSTALL httpfs через DuckDB и копия файла в apps/sync-worker.
 * Локальный файл httpfs.duckdb_extension в git не хранится (.gitignore).
 */
const duckdb = require('duckdb');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const dest = path.join(__dirname, '..', 'apps', 'sync-worker', 'httpfs.duckdb_extension');

const db = new duckdb.Database(':memory:');
db.run('INSTALL httpfs;', (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  let found;
  try {
    const out = execSync('find /root/.duckdb -name httpfs.duckdb_extension 2>/dev/null', {
      encoding: 'utf8',
    });
    found = out
      .trim()
      .split('\n')
      .filter(Boolean)[0];
  } catch {
    found = undefined;
  }
  if (!found) {
    console.error('httpfs.duckdb_extension не найден под /root/.duckdb после INSTALL');
    process.exit(1);
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(found, dest);
  console.log('DuckDB httpfs:', found, '->', dest);
  process.exit(0);
});
