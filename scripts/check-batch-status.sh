#!/bin/bash
# Диагностика статусов батчей и contacts:status
# Использование:
#   ./scripts/check-batch-status.sh              — список батчей
#   ./scripts/check-batch-status.sh BATCH_ID      — детали батча и статусы компаний
#   ./scripts/check-batch-status.sh BATCH_ID inn  — статус конкретного ИНН
#
# Требует: docker compose + Redis. Альтернатива: redis-cli напрямую если REDIS_HOST=localhost

REDIS_CMD="docker compose exec -T redis redis-cli"
if ! docker compose ps redis 2>/dev/null | grep -q Up; then
  echo "Redis не запущен. Запустите: docker compose up -d redis"
  exit 1
fi

list_batches() {
  echo "=== Список батчей (последние 10) ==="
  $REDIS_CMD ZREVRANGE batch:list 0 9
}

batch_detail() {
  local bid="$1"
  echo "=== Батч: $bid ==="
  echo ""
  echo "Метаданные:"
  $REDIS_CMD HGETALL "batch:$bid" | paste - - | sed 's/\t/ = /g'
  echo ""
  local inns_json=$($REDIS_CMD HGET "batch:$bid" inns)
  if [ -n "$inns_json" ]; then
    echo "Статусы компаний (contacts:status:INN):"
    echo "$inns_json" | python3 -c "
import sys, json
try:
    inns = json.load(sys.stdin)
    for x in inns:
        inn = x.get('inn','')
        name = (x.get('name','') or inn)[:40]
        print(f'  {inn} | {name}') 
except: pass
" 2>/dev/null || echo "  (не удалось распарсить inns)"
  fi
}

check_inns_status() {
  local bid="$1"
  local inns_json=$($REDIS_CMD HGET "batch:$bid" inns)
  if [ -z "$inns_json" ]; then
    echo "Батч не найден или пуст"
    return
  fi
  echo "=== Статусы по ИНН для батча $bid ==="
  echo ""
  echo "$inns_json" | python3 -c "
import sys, json, os
inns = json.load(sys.stdin)
for x in inns:
    inn = x.get('inn','')
    name = (x.get('name','') or inn)[:35]
    # redis-cli HGET key field
    cmd = f\"docker compose exec -T redis redis-cli HGET contacts:status:{inn} status\"
    p = os.popen(cmd)
    st = (p.read() or '').strip().strip('\"')
    p.close()
    err = ''
    if st == 'error':
        cmd2 = f\"docker compose exec -T redis redis-cli HGET contacts:status:{inn} error\"
        p2 = os.popen(cmd2)
        err = (p2.read() or '').strip().strip('\"')[:50]
        p2.close()
    status_ru = {'completed':'Завершено','running':'В работе','error':'Ошибка','idle':'Ожидание','pending':'Ожидание'}.get(st, st)
    print(f'{inn} | {status_ru:12} | {name}')
    if err:
        print(f'       error: {err}')
" 2>/dev/null
}

check_single_inn() {
  local inn="$1"
  echo "=== contacts:status:$inn ==="
  $REDIS_CMD HGETALL "contacts:status:$inn" | paste - - | sed 's/\t/ = /g'
}

# API через curl (нужен пароль из ADMIN_PASSWORD или .env)
api_batches() {
  local base="${BASE_URL:-http://localhost:3140}"
  local auth="${ADMIN_PASSWORD:-}"
  if [ -z "$auth" ] && [ -f .env ]; then
    auth=$(grep ADMIN_PASSWORD .env 2>/dev/null | cut -d= -f2- | tr -d '" ')
  fi
  if [ -z "$auth" ]; then
    echo "Укажите ADMIN_PASSWORD или добавьте в .env для curl-запросов"
    return
  fi
  echo "=== GET /api/batches ==="
  curl -s -H "Authorization: $auth" "$base/api/batches?limit=5" | python3 -m json.tool 2>/dev/null || curl -s -H "Authorization: $auth" "$base/api/batches?limit=5"
}

case "${1:-}" in
  "")
    list_batches
    echo ""
    echo "Для деталей: $0 BATCH_ID"
    ;;
  api)
    api_batches
    ;;
  *)
    if [ -n "${2:-}" ] && [ "$2" = "inn" ]; then
      check_single_inn "$1"
    else
      batch_detail "$1"
      echo ""
      check_inns_status "$1"
    fi
    ;;
esac
