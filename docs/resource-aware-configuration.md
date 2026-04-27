# Resource-Aware Configuration

## Overview

INFOINDEXER automatically detects available system resources and adapts ClickHouse configuration accordingly. This ensures optimal performance across different deployment scenarios from 2GB VPS to large-scale servers.

## How It Works

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  RESOURCE DETECTION FLOW                                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. Resource Discovery                                                      │
│     ├─ Try cgroup v2: /sys/fs/cgroup/memory/max                            │
│     ├─ Try cgroup v1: /sys/fs/cgroup/memory/memory.limit_in_bytes           │
│     └─ Fallback to OS: os.totalmem()                                       │
│                                                                             │
│  2. Profile Selection                                                       │
│     ├─ LOW: < 4GB (50% memory, 30s timeout, 1 thread)                     │
│     ├─ STANDARD: 4-16GB (60% memory, 120s timeout, 2 threads)              │
│     └─ HIGH: > 16GB (80% memory, 180s timeout, 4 threads)                  │
│                                                                             │
│  3. Health Check                                                            │
│     ├─ < 2GB: FAIL - insufficient memory                                    │
│     ├─ 2-4GB: DEGRADED - low memory warning                                │
│     ├─ 4-8GB: DEGRADED - consider upgrade                                  │
│     └─ > 8GB: HEALTHY                                                       │
│                                                                             │
│  4. Configuration Calculation                                                │
│     └─ max_memory_usage = total_memory × profile.memory_utilization        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Configuration Profiles

### LOW Profile (< 4GB)

For small VPS or development environments:

| Setting | Value |
|---------|-------|
| Max Memory | 50% of available |
| Max Execution Time | 30 seconds |
| Max Threads | 1 |
| Batch Size | 100,000 records |

**Use case:** Development, testing, small datasets

### STANDARD Profile (4-16GB)

For production servers with moderate resources:

| Setting | Value |
|---------|-------|
| Max Memory | 60% of available |
| Max Execution Time | 120 seconds |
| Max Threads | 2 |
| Batch Size | 1,000,000 records |

**Use case:** Standard production deployment

### HIGH Profile (> 16GB)

For large-scale production:

| Setting | Value |
|---------|-------|
| Max Memory | 80% of available |
| Max Execution Time | 180 seconds |
| Max Threads | 4+ |
| Batch Size | 5,000,000 records |

**Use case:** Large datasets (50M+ records)

## Environment Variables

| Variable | Description | Values |
|----------|-------------|--------|
| `CONFIG_PROFILE` | Override auto-detection | `low`, `standard`, `high` |

**Example:**
```bash
# Force low-memory mode on 8GB server
CONFIG_PROFILE=low npm start
```

## API Usage

### Initialization

```typescript
import {
  createResourceAwareConfigService,
  CgroupResourceDiscoveryAdapter,
  ConfigProfileSelectorAdapter,
  StartupHealthCheckAdapter
} from '@infoindexer/shared';

// Create service with default adapters
const configService = createResourceAwareConfigService();

// Initialize (detect resources, select profile, validate)
const result = await configService.initialize();

if (result.status === 'unhealthy') {
  console.error(result.reason);
  console.log(result.action);
  process.exit(1);
}

if (result.warning) {
  console.warn(result.warning);
}

// Get calculated settings
const { maxMemoryUsage, maxExecutionTime, maxThreads } = configService.getConfig();
```

### Get Health Report

```typescript
const report = configService.getHealthReport();
console.log(report);

// Output:
// === Resource-Aware Configuration ===
// Memory: 8.0GB (cgroup-v2)
// Profile: Standard
// Max Memory: 4.8GB (60%)
// Max Threads: 2
// Batch Size: 1,000,000 records
// =====================================
```

## Docker Deployment

### Memory Requirements

| Scenario | Minimum RAM | Recommended |
|----------|-------------|-------------|
| Development | 2GB | 4GB |
| Small Production | 4GB | 8GB |
| Large Production | 8GB | 16GB+ |

### Docker Compose

```yaml
services:
  egrul-sync-worker:
    environment:
      - CONFIG_PROFILE=auto  # Auto-detect (default)
    deploy:
      resources:
        limits:
          memory: 8G
        reservations:
          memory: 4G
```

## Troubleshooting

### "Insufficient memory" Error

**Symptom:** Application fails to start with memory error.

**Solution:**
1. Increase Docker memory limit
2. Use managed ClickHouse service
3. Deploy to larger server

### Low Performance

**Symptom:** Queries are slow, batch processing takes long time.

**Solution:**
1. Check current profile: `console.log(configService.getHealthReport())`
2. Upgrade server memory
3. Override profile: `CONFIG_PROFILE=high`

### Profile Not Applied

**Symptom:** Expected profile not selected.

**Solution:**
1. Check available memory: `free -h` or `docker stats`
2. Check cgroup limits: `cat /sys/fs/cgroup/memory.max`
3. Verify env variable: `echo $CONFIG_PROFILE`

## Implementation Details

### Architecture

```
Domain Layer (Inner)
├─ Value Objects: MemorySize, ConfigProfile, ResourceInfo
├─ Services: ResourceCalculationService
└─ Ports: IResourceDiscoveryPort, IConfigProfileSelectorPort, IStartupHealthCheckPort

Infrastructure Layer (Outer)
├─ Adapters: CgroupResourceDiscoveryAdapter, OSResourceDiscoveryAdapter
├─ Adapters: ConfigProfileSelectorAdapter, StartupHealthCheckAdapter
└─ Implementation: cgroup reads, OS API calls

Application Layer
└─ ResourceAwareConfigService (orchestration)
```

### Design Patterns

- **Port & Adapter:** Resource discovery abstracted behind ports
- **Value Object:** Immutable configuration data
- **Strategy:** Different profiles for different memory ranges
- **Factory:** `createResourceAwareConfigService()` for easy instantiation

## References

- ClickHouse Memory Settings: https://clickhouse.com/docs/en/operations/settings
- Docker Resources: https://docs.docker.com/engine/reference/commandline/run/#set-resource-constraints
- Cgroup v2: https://docs.kernel.org/admin-guide/cgroup-v2.html
