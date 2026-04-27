# Docker Memory Configuration for INFOINDEXER

## Overview

This document defines Docker memory limits for production deployment of INFOINDEXER EGRUL Sync Worker with ClickHouse database.

## Requirements

### Docker Desktop Settings

For production use with EGRUL sync (50M+ records):

1. Open Docker Desktop
2. Go to **Settings → Resources → Advanced**
3. Set **Memory** to at least **10GB**
4. Click **Apply & Restart**

**Why 10GB?**
- ClickHouse requires ~8GB for large queries
- 2GB headroom for process overhead
- Other containers (Redis, workers) need additional memory

## Memory Calculations

### Formula

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  MEMORY ALLOCATION FORMULA                                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Docker Memory Limit: 10GB                                                 │
│  ├─ ClickHouse MAX_MEMORY_USAGE: 8GB (80% of limit)                       │
│  ├─ ClickHouse overhead: ~1GB (server process)                            │
│  └─ Headroom: 1GB (safety margin)                                          │
│                                                                             │
│  Formula: MAX_MEMORY_USAGE = Docker_Limit × 0.8                            │
│  Example: 10GB × 0.8 = 8GB                                                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Configuration Matrix

| Docker Limit | MAX_MEMORY_USAGE | Headroom | HTTP Timeout | SQL Timeout | Margin |
|--------------|------------------|----------|--------------|-------------|---------|
| 10GB | 8GB | 2GB (20%) | 360s | 180s | 2x |
| 12GB | 9.6GB | 2.4GB (20%) | 360s | 180s | 2x |
| 16GB | 12.8GB | 3.2GB (20%) | 360s | 180s | 2x |

## Implementation

### Docker Compose Configuration

Memory limits are enforced via `docker-compose.yml`:

```yaml
services:
  clickhouse:
    deploy:
      resources:
        limits:
          memory: 10G
        reservations:
          memory: 4G
```

**Parameters:**
- `limits.memory`: Hard limit, OOM Killer if exceeded
- `reservations.memory`: Guaranteed minimum for scheduling

### ClickHouse Settings

Configured in `packages/shared/infrastructure/clickhouse.constants.ts`:

```typescript
MAX_EXECUTION_TIME: 180,        // seconds (3 minutes)
MAX_MEMORY_USAGE: '8000000000', // 8GB (80% of Docker limit)
```

**Timeout Hierarchy:**
```
HTTP Timeout (360s) > SQL Timeout (180s) × 2 = Safe Margin
```

## Verification

### Check Container Memory Usage

```bash
# Real-time memory statistics
docker stats clickhouse

# Detailed memory info
docker exec clickhouse clickhouse-client --query "SELECT * FROM system.metrics WHERE metric LIKE '%memory%'"
```

### Expected Output

```
CONTAINER   NAME        CPU %     MEM USAGE / LIMIT   MEM %
abc123      clickhouse   5.23%    7.8GB / 10GB        78%
```

### ClickHouse Memory Settings

```sql
-- Verify max_memory_usage setting
SELECT value, changed
FROM system.settings
WHERE name = 'max_memory_usage';

-- Expected: value = 8000000000 (8GB)
```

## Troubleshooting

### Out of Memory (OOM)

**Symptoms:**
- Container exits with code 137
- `docker logs clickhouse` shows "Memory limit exceeded"

**Solutions:**
1. Increase Docker Desktop memory limit
2. Reduce `MAX_MEMORY_USAGE` in constants
3. Reduce batch size in `BatchConfig`

### Query Timeout

**Symptoms:**
- Error: "Timeout exceeded"
- Queries cancelled after N seconds

**Solutions:**
1. Increase `MAX_EXECUTION_TIME` in constants
2. Verify HTTP timeout > SQL timeout × 2
3. Check query optimization (indexes, partitions)

## References

- ClickHouse Settings: https://clickhouse.com/docs/en/operations/settings
- Docker Resources: https://docs.docker.com/engine/reference/commandline/run/#set-resource-constraints
- Implementation Plan: `Plans/clickhouse-oom-fix-implementation-plan.md`
