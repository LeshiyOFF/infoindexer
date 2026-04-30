---
name: Next.js Standalone Monorepo Docker
description: Next.js 14 standalone mode в monorepo - структура Dockerfile, расположение server.js и node_modules
type: project
category: architecture
---

# Next.js Standalone в Monorepo: Dockerfile Pattern

## Проблема

**Симптом:** Контейнер admin-ui перезапускается с ошибкой:
```
Error: Cannot find module 'next'
Require stack:
- /app/apps/admin-ui/server.js
```

**Следствие:** Admin UI недоступен, контейнер в цикле рестарта.

---

## Корневая причина

В **monorepo** с `output: 'standalone'` Next.js создаёт специфическую структуру:

```
.next/standalone/
  ├── node_modules/          ← ← ← ЗДЕСЬ Next.js (в корне!)
  ├── packages/shared/
  └── apps/admin-ui/
      ├── server.js          ← ← ← Точка входа приложения
      ├── .next/
      └── package.json
```

**В обычном (не monorepo) проекте:**
```
.next/standalone/
  ├── node_modules/
  └── server.js              ← server.js в корне
```

---

## Диагностика

1. **Локальная проверка структуры standalone:**
   ```bash
   find apps/admin-ui/.next/standalone -name "server.js"
   # Результат: apps/admin-ui/.next/standalone/apps/admin-ui/server.js
   ```

2. **Проверка runtime логов на сервере:**
   ```bash
   ssh server "docker compose logs admin-ui --tail=50"
   # Ошибка: Cannot find module 'next'
   ```

3. **Анализ показал:** `node_modules` с Next.js находится в корне standalone, а не в `apps/admin-ui/`

---

## Решение

Использовать **официальный паттерн Turborepo** для Next.js в monorepo:

```dockerfile
# Stage 3: Production Runner
FROM node:20-alpine AS runner

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

USER nextjs
WORKDIR /app

# Копируем standalone целиком (сохраняет структуру монорепо)
COPY --from=builder --chown=nextjs:nodejs /app/apps/admin-ui/.next/standalone ./

# Копируем статические файлы (официальный метод Next.js)
COPY --from=builder --chown=nextjs:nodejs /app/apps/admin-ui/public ./apps/admin-ui/public/
COPY --from=builder --chown=nextjs:nodejs /app/apps/admin-ui/.next/static ./apps/admin-ui/.next/static/

# Полный путь в CMD (официальный паттерн Turborepo)
CMD ["node", "apps/admin-ui/server.js"]
```

**Ключевые моменты:**
1. Один `WORKDIR /app` (не в apps/admin-ui)
2. `COPY standalone ./` — сохраняет структуру монорепо
3. `CMD` с полным путём к server.js

---

## Источники

- [Official Turborepo Docker Example](https://github.com/vercel/turborepo/blob/main/examples/with-docker/apps/web/Dockerfile)
- [Next.js Output Documentation](https://nextjs.org/docs/app/api-reference/config/next-config-js/output)
- [Build with Matija - Ultimate Next.js Standalone Guide](https://www.buildwithmatija.com/blog/nextjs-standalone-dockerfile-guide)

---

## Дата решения

2026-04-29

---

## Related Files

- `apps/admin-ui/Dockerfile`
- `apps/admin-ui/next.config.mjs`
- `docker-compose.yml`
- `docker-compose.prod.yml`
