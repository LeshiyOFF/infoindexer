# Деплой через GitHub Actions

## Настройка SSH ключей

### 1. Генерация SSH ключа на сервере

```bash
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github_actions -N ""
cat ~/.ssh/github_actions.pub >> ~/.ssh/authorized_keys
```

### 2. Добавление Secrets в GitHub

Перейдите в: https://github.com/LeshiyOFF/infoindexer/settings/secrets/actions

Добавьте следующие secrets:

| Name | Value | Описание |
|------|-------|----------|
| `SSH_PRIVATE_KEY` | (приватный ключ) | Содержимое `~/.ssh/github_actions` |
| `SERVER_HOST` | `38.180.146.98` | IP сервера |
| `SERVER_USER` | `root` | Пользователь SSH |

### 3. Первоначальная настройка сервера

```bash
# SSH на сервер
ssh root@38.180.146.98

# Клонировать репозиторий
cd /root
git clone https://github.com/LeshiyOFF/infoindexer.git
cd infoindexer

# Настроить .env (скопировать с локальной машины или создать заново)
cp .env.example .env
# редактировать .env

# Запустить
docker-compose up -d --build
```

### 4. Проверка деплоя

Теперь при каждом push в ветку `master`:
1. Собирается проект
2. Подключается к серверу по SSH
3. Git pull
4. Пересобираются Docker контейнеры
5. Проверяется health

## Ручной запуск деплоя

GitHub Actions → Workflows → Deploy to Production Server → Run workflow
