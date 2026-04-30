# ClickHouse Configuration Architecture

## Overview

INFOINDEXER uses a modular, Single-Responsibility configuration architecture for ClickHouse. Each configuration file has a specific purpose and loads in numerical order.

## File Structure

```
docker/clickhouse-config.d/
├── 01-base-profiles.xml          # User profiles (default, readonly, workers, etc.)
├── 02-query-limits.xml           # Query complexity guards
├── 03-join-settings.xml          # JOIN algorithms and spill-to-disk
├── 04-low-memory-merge-tree.xml  # Merge Tree optimizations (8GB RAM)
├── audit-log.xml                 # Query logging
├── merge-tree-broken-parts.xml   # Broken parts handling
└── ssl.xml                       # TLS/SSL configuration
```

## Configuration Files

### 01-base-profiles.xml

Defines user profiles with their memory and concurrency settings:

| Profile | Purpose | Memory | Threads |
|---------|---------|--------|---------|
| `default` | Base profile with spill-to-disk | 10GB | 4 |
| `readonly` | API users (read-only) | 2GB | - |
| `workers` | Background jobs | 10GB | 4 |
| `egrul_worker` | EGRUL sync operations | 7GB | - |
| `batch_operations` | Heavy batch processing | 9GB | 8 |

### 02-query-limits.xml

Query complexity guards:

- `max_rows_to_read`: 5M (default), 100M (batch)
- `max_bytes_to_read`: 5GB
- `max_execution_time`: 300s (default), 3600s (batch)

### 03-join-settings.xml

JOIN algorithm settings (ClickHouse 24.3 compatible):

- `join_algorithm`: `partial_merge` (default), `grace_hash` (batch)
- `max_bytes_in_join`: 2GB (default), 5GB (batch)
- `join_overflow_mode`: `break`

**Migration Note**: `max_bytes_before_external_join` was removed in ClickHouse 23.8+

### 04-low-memory-merge-tree.xml

Optimizations for 8GB RAM servers:

- `mark_cache_size`: 256MB (reduced from 5GB)
- `max_server_memory_usage_to_ram_ratio`: 0.75 (6GB limit)
- `merge_max_block_size`: 1024 (reduced from 8192)

## TypeScript Configuration Builder

Located in `packages/shared/src/config/`, the configuration builder implements Hexagonal Architecture:

```
Domain Layer (Ports)
  ├── Value Objects (ConfigProfileName, ConfigQuota, etc.)
  ├── DTOs (ConfigMigrationResult)
  └── Interfaces (IClickHouseConfigProfile, IClickHouseConfigBuilder)

Application Layer (Services)
  ├── ConfigProfileFactory (creates standard profiles)
  └── ConfigMigrationService (migrates old → new format)

Infrastructure Layer (Adapters)
  ├── ClickHouseConfigBuilderAdapter (XML generation)
  ├── ClickHouseConfigValidatorAdapter (validation)
  └── ClickHouseXmlSerializerHelper (pure functions)
```

## Usage

```typescript
import { createStandardConfigBuilder } from '@/config';

const builder = createStandardConfigBuilder();
const xml = builder.build();
await builder.buildToFile('/path/to/config.xml');
```

## Adding a New Profile

1. Add profile definition to `ConfigProfileFactory`
2. Add to `01-base-profiles.xml` or create new file
3. Update this documentation

## Troubleshooting

### Exit Code 115

**Error**: `Setting max_bytes_before_external_join is neither a builtin setting...`

**Solution**: The configuration has been updated to use `join_algorithm` instead. Ensure you're using the new `03-join-settings.xml`.

### OOM Errors

Check `04-low-memory-merge-tree.xml` settings are applied:
```bash
docker exec infoindexer-clickhouse-1 clickhouse-client \
  "SELECT name, value FROM system.settings WHERE name LIKE '%memory%'"
```

## References

- [ClickHouse Query Complexity Settings](https://clickhouse.com/docs/en/operations/settings/query-complexity)
- [ClickHouse JOIN Documentation](https://clickhouse.com/docs/en/sql-reference/statements/select/join)
- [Altinity Low Memory Configuration](https://kb.altinity.com/altinity-kb-setup-and-maintenance/configure_clickhouse_for_low_mem_envs/)
