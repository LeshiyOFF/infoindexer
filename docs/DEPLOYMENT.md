# Деплой через GitHub Actions

## Быстрый старт

### 1. Настройка сервера (один раз)

```bash
# SSH на сервер
ssh root@38.180.146.98

# Скачать и запустить setup скрипт
cd /root
git clone https://github.com/LeshiyOFF/infoindexer.git
cd infoindexer
chmod +x scripts/setup-server.sh
sudo ./scripts/setup-server.sh
```

### 2. Добавить Secrets в GitHub

Перейти в: https://github.com/LeshiyOFF/infoindexer/settings/secrets/actions

| Secret | Value |
|--------|-------|
| `DEPLOY_SSH_KEY` | Вывод команды (приватный ключ из `setup-server.sh`) |
| `SERVER_HOST` | `38.180.146.98` |
| `SERVER_USER` | `root` |

### 3. Настроить .env на сервере

```bash
ssh root@38.180.146.98
cd /root/infoindexer
cp .env.example .env
nano .env  # отредактировать
```

### 4. Первый запуск

```bash
cd /root/infoindexer
docker compose up -d
```

## Автоматический деплой

После настройки — каждый push в `master` автоматически деплоится:

```
push → CI → Docker Build → Deploy → Health Check
```

## Ручной деплой

### Через GitHub Actions

1. GitHub Actions → Workflows → Deploy to Production
2. Нажать "Run workflow"

### Через SSH

```bash
ssh root@38.180.146.98
/usr/local/bin/infoindexer-deploy
```

### Вручную

```bash
ssh root@38.180.146.98
cd /root/infoindexer

# Pull latest code
git config core.sshCommand "ssh -i /root/.ssh/deploy_github -o StrictHostKeyChecking=no"
git fetch origin
git reset --hard origin/master
git clean -fd

# Pull images and recreate services
docker compose -f docker-compose.yml -f docker-compose.prod.yml pull
docker compose -f docker-compose.yml -f docker-compose.prod.yml down --remove-orphans
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d clickhouse redis

# Wait for core services (ClickHouse ~60s, Redis ~5s)
timeout 60s bash -c 'until docker compose -f docker-compose.yml -f docker-compose.prod.yml exec -T clickhouse clickhouse-client --query "SELECT 1" &>/dev/null; do sleep 1; done'
timeout 30s bash -c 'until docker compose -f docker-compose.yml -f docker-compose.prod.yml exec -T redis redis-cli ping &>/dev/null; do sleep 1; done'

# Start remaining services
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## Мониторинг

```bash
# Статус сервисов
ssh root@SERVER_HOST "cd /root/infoindexer && docker compose ps"

# Логи
ssh root@SERVER_HOST "cd /root/infoindexer && docker compose logs -f"

# Health check
curl http://38.180.146.98:3140/api/health
```

## Откат

```bash
ssh root@SERVER_HOST
cd /root/infoindexer
./scripts/rollback.sh
```

Подробнее: см. [docs/ROLLBACK.md](ROLLBACK.md)

## Troubleshooting

### Деплой не запускается

Проверить GitHub Secrets:
```bash
# Проверить SSH ключ
ssh -i ~/.ssh/deploy_key root@38.180.146.98
```

### Контейнеры не стартуют

```bash
ssh root@SERVER_HOST
cd /root/infoindexer
docker compose logs
```

### Нет доступа к API

```bash
# Проверить порт
curl http://38.180.146.98:3140/api/health

# Проверить firewall на сервере
ufw status
```
