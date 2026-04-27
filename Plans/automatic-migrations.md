# Automatic Migrations — Production Grade

**Дата:** 2026-04-24
**Статус:** ✅ Implemented
**Версия:** 1.0

## Обзор

Система автоматического применения миграций при старте Docker контейнеров. Следует стандартам индустрии для init containers в Kubernetes и Docker Compose.

## Архитектура

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Docker Compose / Kubernetes                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐       │
│  │ ClickHouse   │────▶│   migration- │────▶│ API, Workers │       │
│  │ (healthcheck)│     │    worker    │     │ (depends_on) │       │
│  └──────────────┘     └──────────────┘     └──────────────┘       │
│                              │                                      │
│                              ▼                                      │
│                       ┌──────────────┐                             │
│                       │   Redis      │                             │
│                       │ (dist. lock) │                             │
│                       └──────────────┘                             │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Компоненты

### 1. Migration Worker

**Режимы работы:**

| Режим | Описание | Использование |
|-------|----------|----------------|
| `once` (default) | Применить миграции и завершиться | Docker init pattern |
| `scheduled` | Запускать по расписанию | Legacy daemon mode |

**Переменные окружения:**

```bash
MIGRATION_MODE=once                    # Режим работы (default: once)
MIGRATION_AUTO_CLEANUP=false           # Очистка БД перед миграциями (dangerous!)
MIGRATIONS_BASE_DIR=/app/.../files     # Путь к SQL файлам
```

### 2. Distributed Lock

**Предотвращает параллельные миграции** в multi-instance окружении.

- **Implementation:** Redis SET NX (SET if Not eXists)
- **TTL:** 5 минут (автоматическое освобождение)
- **Wait timeout:** 10 секунд

**Логика:**
```
Instance A: acquireLock("migrations") → SUCCESS → run migrations → release
Instance B: acquireLock("migrations") → WAIT → timeout → exit(2)
```

### 3. Healthcheck

**Проверяет успешность применения миграций:**

```bash
test -f /tmp/migrations-completed && grep -q '"success":true' /tmp/migrations-completed
```

**Формат файла-маркера:**

```json
{
  "totalMigrations": 4,
  "appliedMigrations": 2,
  "skippedMigrations": 2,
  "failedMigrations": 0,
  "durationMs": 1234
}
```

## Использование

### Dev Environment (с очисткой)

```bash
# Полная очистка и применение с нуля
MIGRATION_AUTO_CLEANUP=true docker compose up --build
```

**Что происходит:**
1. ClickHouse запускается
2. Migration-worker удаляет и пересоздаёт БД
3. Применяются все миграции (000-004)
4. Остальные сервисы запускаются после успешного завершения

### Production

```bash
# Обычный запуск (применяет только новые миграции)
docker compose up -d
```

**Что происходит:**
1. ClickHouse запускается
2. Migration-worker применяет только новые миграции
3. Остальные сервисы запускаются

## Docker Compose Configuration

```yaml
services:
  migration-worker:
    # ...
    environment:
      - MIGRATION_MODE=once
      - MIGRATION_AUTO_CLEANUP=${MIGRATION_AUTO_CLEANUP:-false}
    restart: "no"
    healthcheck:
      test: ["CMD-SHELL", "test -f /tmp/migrations-completed && grep -q '\"success\":true' /tmp/migrations-completed || exit 1"]
      interval: 5s
      timeout: 3s
      retries: 1

  api:
    depends_on:
      migration-worker:
        condition: service_completed_successfully
```

## Kubernetes Configuration

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
spec:
  template:
    spec:
      initContainers:
      - name: migrations
        image: infoindexer/migration-worker:v1.0.0
        env:
        - name: MIGRATION_MODE
          value: "once"
      containers:
      - name: api
        image: infoindexer/api:v1.0.0
```

## Exit Codes

| Код | Значение | Action |
|-----|----------|--------|
| 0 | Успех | Continue |
| 1 | Ошибка миграции | Stop, check logs |
| 2 | Lock timeout | Another instance running |

## Отказоустойчивость

| Сценарий | Поведение |
|----------|-----------|
| Migration worker crashed | Перезапуск с применением миграций (идемпотентность) |
| Multiple instances started | Distributed lock, только один applies |
| ClickHouse unavailable | Healthcheck fail, retry |
| Partial migration applied | Re-run applies only pending |

## Безопасность

⚠️ **НИКОГДА не использовать `MIGRATION_AUTO_CLEANUP=true` в production!**

Эта опция:
- Удаляет ВСЕ данные без возможности восстановления
- Используется только для dev/testing
- Требует явного подтверждения через переменную окружения

## Мониторинг

### Логи

```
[Lock] Acquired 'migrations' (attempt 1, id: instance-host-123-456)
Applying migrations...
Migration shared/001 applied in 1234ms
Migrations completed in 5678ms: { totalMigrations: 4, ... }
Migration completed, exiting (once mode)
```

### Метрики (TODO)

- `migrations_applied_total`
- `migrations_duration_seconds`
- `migrations_lock_acquired_total`

## Troubleshooting

### Migration worker не завершается

```bash
# Проверить логи
docker compose logs migration-worker

# Проверить lock
docker compose exec redis redis-cli GET lock:migrations
```

### Сервисы не запускаются

```bash
# Проверить healthcheck
docker compose ps

# Проверить файл-маркер
docker compose exec migration-worker cat /tmp/migrations-completed
```

### Миграции не применяются

```bash
# Проверить schema_migrations
docker compose exec clickhouse clickhouse-client --query "SELECT * FROM schema_migrations"

# Принудительно применить
docker compose restart migration-worker
```

## Roadmap

- [ ] Структурированное логирование (pino)
- [ ] Метрики Prometheus
- [ ] Rollback поддержка
- [ ] Dry-run режим для preview
- [ ] Web UI для статуса миграций
