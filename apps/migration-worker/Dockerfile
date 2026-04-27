# Migration Worker Dockerfile
#
# @remarks
# Multi-stage build для минимизации размера образа.
# Использует предварительно собранный shared пакет.

FROM node:20-alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json файлы проекта
COPY package.json package-lock.json ./
COPY apps/migration-worker/package.json ./apps/migration-worker/

# Копируем package.json и собранные файлы shared пакета
COPY packages/shared/package.json ./packages/shared/package.json
COPY packages/shared/dist ./packages/shared/dist

# Устанавливаем все зависимости
RUN npm install --production --ignore-scripts

# Копируем собранные файлы migration-worker
COPY apps/migration-worker/dist ./apps/migration-worker/dist

# Копируем SQL файлы миграций
COPY packages/shared/infrastructure/migrations/files ./packages/shared/infrastructure/migrations/files

# Устанавливаем переменную окружения для миграций
ENV MIGRATIONS_BASE_DIR=/app/packages/shared/infrastructure/migrations/files

# Запускаем миграционный воркер
CMD ["node", "apps/migration-worker/dist/index.js"]
