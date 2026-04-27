#!/bin/bash
# Проверка API организаций с фильтром ОКВЭД через curl.
# Использует ADMIN_PASSWORD из .env или переменной окружения.

set -e
cd "$(dirname "$0")/.."

# Пароль из .env или окружения
AUTH="${ADMIN_PASSWORD:-}"
if [[ -z "$AUTH" && -f .env ]]; then
  AUTH=$(grep '^ADMIN_PASSWORD=' .env 2>/dev/null | cut -d= -f2- | tr -d '" ')
fi
if [[ -z "$AUTH" ]]; then
  echo "Ошибка: ADMIN_PASSWORD не задан. Добавьте в .env или экспортируйте переменную."
  exit 1
fi

# Базовый URL (admin-ui в Docker на 3140, локально — 3000)
BASE="${BASE_URL:-http://localhost:3140}"

echo "=== Тест API организаций с фильтром ОКВЭД ==="
echo "Base URL: $BASE"
echo ""

# 0. Список кодов ОКВЭД из БД (для отладки okved-list)
echo "--- 0. GET /api/organizations/okved-list ---"
RES0=$(curl -s -w "\n%{http_code}" -H "Authorization: $AUTH" "${BASE}/api/organizations/okved-list")
HTTP0=$(echo "$RES0" | tail -n1)
BODY0=$(echo "$RES0" | sed '$d')
echo "HTTP: $HTTP0"
if [[ "$HTTP0" == "200" ]]; then
  CNT=$(echo "$BODY0" | jq -r '.data | length' 2>/dev/null)
  echo "data count: $CNT"
  echo "error: $(echo "$BODY0" | jq -r '.error // "null"' 2>/dev/null || echo '-')"
  if [[ -n "$CNT" && "$CNT" != "null" && "$CNT" -gt 0 ]]; then
    echo "Первые 3 кода: $(echo "$BODY0" | jq -r '[.data[0:3][].code] | join(", ")' 2>/dev/null)"
  fi
else
  echo "$BODY0" | head -c 400
fi
echo ""

# 1. Без фильтра ОКВЭД (baseline)
echo "--- 1. Запрос без okved ---"
RES1=$(curl -s -w "\n%{http_code}" -H "Authorization: $AUTH" \
  "${BASE}/api/organizations?page=1&limit=3")
HTTP1=$(echo "$RES1" | tail -n1)
BODY1=$(echo "$RES1" | sed '$d')
echo "HTTP: $HTTP1"
if [[ "$HTTP1" == "200" ]]; then
  TOTAL_NO_FILTER=$(echo "$BODY1" | jq -r '.pagination.total' 2>/dev/null)
  echo "data count: $(echo "$BODY1" | jq -r '.data | length' 2>/dev/null || echo 'jq missing')"
  echo "total: $TOTAL_NO_FILTER"
  echo "error: $(echo "$BODY1" | jq -r '.error // "null"' 2>/dev/null || echo '-')"
else
  echo "$BODY1" | head -c 500
fi
echo ""

# 2. С фильтром ОКВЭД 62 (разработка ПО)
echo "--- 2. Запрос okved=62 (разработка ПО) ---"
RES2=$(curl -s -w "\n%{http_code}" -H "Authorization: $AUTH" \
  "${BASE}/api/organizations?page=1&limit=5&okved=62")
HTTP2=$(echo "$RES2" | tail -n1)
BODY2=$(echo "$RES2" | sed '$d')
echo "HTTP: $HTTP2"
if [[ "$HTTP2" == "200" ]]; then
  CNT=$(echo "$BODY2" | jq -r '.data | length' 2>/dev/null)
  TOTAL_WITH_62=$(echo "$BODY2" | jq -r '.pagination.total' 2>/dev/null)
  OKVED_FIRST=$(echo "$BODY2" | jq -r '.data[0].okved // empty' 2>/dev/null)
  echo "data count: $CNT"
  echo "total (okved=62): $TOTAL_WITH_62"
  echo "error: $(echo "$BODY2" | jq -r '.error // "null"' 2>/dev/null || echo '-')"
  if [[ -n "$CNT" && "$CNT" != "null" && "$CNT" -gt 0 ]]; then
    echo "Первый okved в ответе: $(echo "$BODY2" | jq -r '.data[0].okved // "нет поля"' 2>/dev/null)"
    echo "Все okved: $(echo "$BODY2" | jq -r '[.data[].okved] | join(", ")' 2>/dev/null)"
  fi
  if [[ -n "$TOTAL_NO_FILTER" && -n "$TOTAL_WITH_62" && "$TOTAL_WITH_62" != "null" ]]; then
    if [[ "$TOTAL_WITH_62" -ge "$TOTAL_NO_FILTER" ]]; then
      echo "ОШИБКА: total с okved=62 ($TOTAL_WITH_62) должен быть меньше total без фильтра ($TOTAL_NO_FILTER)"
      exit 1
    fi
  fi
  if [[ -z "$OKVED_FIRST" && "$CNT" != "0" ]]; then
    echo "ОШИБКА: в data[0] отсутствует поле okved"
    exit 1
  fi
else
  echo "$BODY2" | head -c 600
fi
echo ""

# 3. С фильтром ОКВЭД 62.01 (подкласс)
echo "--- 3. Запрос okved=62.01 (подкласс) ---"
RES3=$(curl -s -w "\n%{http_code}" -H "Authorization: $AUTH" \
  "${BASE}/api/organizations?page=1&limit=5&okved=62.01")
HTTP3=$(echo "$RES3" | tail -n1)
BODY3=$(echo "$RES3" | sed '$d')
echo "HTTP: $HTTP3"
if [[ "$HTTP3" == "200" ]]; then
  CNT=$(echo "$BODY3" | jq -r '.data | length' 2>/dev/null)
  echo "data count: $CNT"
  echo "error: $(echo "$BODY3" | jq -r '.error // "null"' 2>/dev/null || echo '-')"
  if [[ -n "$CNT" && "$CNT" != "null" && "$CNT" -gt 0 ]]; then
    echo "Первый okved: $(echo "$BODY3" | jq -r '.data[0].okved // "нет"' 2>/dev/null)"
  fi
else
  echo "$BODY3" | head -c 600
fi
echo ""

# 4. Ошибочный запрос — буква вместо кода (должен не матчить или колонка отсутствует)
echo "--- 4. Запрос okved=G (буква-раздел, не должен матчить) ---"
RES4=$(curl -s -w "\n%{http_code}" -H "Authorization: $AUTH" \
  "${BASE}/api/organizations?page=1&limit=3&okved=G")
HTTP4=$(echo "$RES4" | tail -n1)
BODY4=$(echo "$RES4" | sed '$d')
echo "HTTP: $HTTP4"
echo "error: $(echo "$BODY4" | jq -r '.error // "null"' 2>/dev/null || echo '-')"
echo ""

echo "=== Готово ==="
