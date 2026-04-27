# Rollback Procedures

## Автоматический откат

### Через скрипт

```bash
# На сервере
ssh root@SERVER_HOST
/usr/local/bin/rollback.sh
```

### Вручную

```bash
# На сервере
cd /root/infoindexer

# Показать историю
git log --oneline -10

# Откатиться на конкретный коммит
git reset --hard <commit-hash>

# Перезапустить
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## Откат Docker образа

```bash
# Показать доступные образы
docker images | grep infoindexer

# Откатиться на предыдущий образ
# В docker-compose.prod.yml указать тег образа
docker compose -f docker-compose.yml -f docker-compose.prod.yml pull
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## Быстрый откат (сломался деплой)

```bash
# Если новый билд не работает
cd /root/infoindexer

# Откатить изменения
git reset --hard HEAD~1

# Перезапустить
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## Полный откат к известному состоянию

```bash
# 1. Остановить всё
docker compose down

# 2. Очистить (ОСТОРОЖНО!)
# docker volume rm infoindexer_clickhouse_data  # только если есть backup!

# 3. Откатить код
cd /root/infoindexer
git reset --hard <stable-commit>

# 4. Перезапустить
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## Скрипт rollback.sh

Автоматизирует процесс отката:

```bash
#!/bin/bash
# Показывает последние 10 коммитов
# Предлагает выбрать для отката
# Подтверждает действие
# Перезапускает сервисы
```

## Disaster Recovery

### Если сервер недоступен

1. Проверить статус через GitHub Actions logs
2. Попробовать SSH подключение
3. Если нет доступа — обратиться к хостеру

### Если данные потеряны

1. Восстановить ClickHouse из backup
2. Восстановить Redis (опционально)
3. Перезапустить сервисы

## Backup Strategy

### ClickHouse

```bash
# Backup
docker exec infoindexer-clickhouse-1 clickhouse-backup create backup_name

# Restore
docker exec infoindexer-clickhouse-1 clickhouse-backup restore backup_name
```

### Redis

```bash
# Backup (RDB файлы в /data)
cp -r /var/lib/docker/volumes/infoindexer_redis_data/_data /backup/redis

# Restore
cp -r /backup/redis/* /var/lib/docker/volumes/infoindexer_redis_data/_data/
```

## Проверка после отката

```bash
# Проверить статус контейнеров
docker compose ps

# Проверить логи
docker compose logs -f

# Проверить API
curl http://localhost:3140/api/health

# Проверить ClickHouse
docker exec infoindexer-clickhouse-1 clickhouse-client --query "SELECT 1"
```
