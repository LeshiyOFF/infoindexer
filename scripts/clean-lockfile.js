const fs = require('fs');
const path = require('path');

const LOCKFILE = path.join(__dirname, '..', 'package-lock.json');

// ОС, чьи нативные пакеты вызывают EBADPLATFORM в Docker (Linux x64)
// Оставляем: linux, win32, darwin (для разных разработчиков)
const FORBIDDEN_OS = ['aix', 'sunos', 'freebsd', 'openbsd', 'netbsd', 'android'];

if (!fs.existsSync(LOCKFILE)) {
  console.log('No package-lock.json found, skipping cleanup');
  process.exit(0);
}

const lockfile = JSON.parse(fs.readFileSync(LOCKFILE, 'utf8'));
let removed = 0;

if (lockfile.packages) {
  for (const [pkgPath, pkgData] of Object.entries(lockfile.packages)) {
    if (pkgPath === '') continue;

    const osList = pkgData.os || [];

    if (osList.length > 0 && osList.every(os => FORBIDDEN_OS.includes(os))) {
      delete lockfile.packages[pkgPath];
      removed++;
    }
  }
}

fs.writeFileSync(LOCKFILE, JSON.stringify(lockfile, null, 2) + '\n');

if (removed > 0) {
  console.log(`✓ Removed ${removed} platform-specific entries from package-lock.json`);
} else {
  console.log('✓ Lockfile is already clean');
}
