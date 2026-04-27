# CI/CD Pipeline

## Обзор

INFOINDEXER использует GitHub Actions для непрерывной интеграции и деплоя.

## Workflow

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────┐
│     Push    │────▶│  CI (quality)    │────▶│     Pass    │
│  to master  │     │  - lint          │     │             │
└─────────────┘     │  - typecheck     │     └──────┬──────┘
                    │  - knip          │             │
                    │  - test          │             ▼
                    └──────────────────┘      ┌─────────────────┐
                                             │ Docker Build    │
                                             │ - push to GHCR  │
                                             └────────┬────────┘
                                                      │
                                                      ▼
                                             ┌─────────────────┐
                                             │     Deploy      │
                                             │ - pull image    │
                                             │ - restart       │
                                             └─────────────────┘
```

## GitHub Actions

### 1. CI Workflow (.github/workflows/ci.yml)

Запускается на каждый push и PR.

**Проверки:**
- Lint (ESLint)
- Type check (TypeScript)
- Knip (unused code/deps)
- Build
- Tests

### 2. Docker Build (.github/workflows/docker-build.yml)

Собирает и публикует Docker образы в GitHub Container Registry.

**Образы:**
- `ghcr.io/leshiyoff/infoindexer:latest` — основной образ
- `ghcr.io/leshiyoff/infoindexer:admin-ui-latest` — Admin UI
- `ghcr.io/leshiyoff/infoindexer:contacts-parser-latest` — Contacts Parser

### 3. Deploy Workflow (.github/workflows/deploy.yml)

Деплой на production сервер.

**Действия:**
1. Подключается по SSH к серверу
2. Git pull
3. Pull новых Docker образов
4. Restart контейнеров
5. Health check
6. Cleanup старых образов

## GitHub Secrets

Добавить в https://github.com/LeshiyOFF/infoindexer/settings/secrets/actions:

| Secret | Value | Пример |
|--------|-------|--------|
| `DEPLOY_SSH_KEY` | Приватный SSH ключ | `ssh-ed25519 AAAA...` |
| `SERVER_HOST` | IP адрес сервера | `38.180.146.98` |
| `SERVER_USER` | Пользователь SSH | `root` |

## Локальный запуск

### Запуск всех workflow

```bash
# Просто push в master
git push origin master
```

### Ручной деплой

```bash
# GitHub Actions → Workflows → Deploy → Run workflow
```

## Troubleshooting

### Docker Build Failed

```bash
# Проверить логи в GitHub Actions
# Локально проверить:
docker build -f Dockerfile .
```

### Deploy Failed

```bash
# Подключиться к серверу
ssh root@SERVER_HOST

# Проверить статус
cd /root/infoindexer
docker compose ps
docker compose logs

# Ручной перезапуск
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Health Check Failed

```bash
# Проверить службы
docker exec infoindexer-clickhouse-1 clickhouse-client --query "SELECT 1"
docker exec infoindexer-redis-1 redis-cli ping
curl http://localhost:3140/api/health
```

## Кэширование

Docker использует GitHub Actions cache для ускорения сборки:

```yaml
cache-from: type=gha
cache-to: type=gha,mode=max
```

Первые сборки медленные (~5-10 мин), последующие быстрее (~2-3 мин).
