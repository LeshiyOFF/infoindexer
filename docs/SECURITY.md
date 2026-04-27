# Security Checklist

## Текущее состояние (После Итерации 2)

| Компонент | Статус | Детали |
|-----------|--------|--------|
| SSH ключи | ✅ | Deploy ключ активен |
| Deploy пользователь | ❌ | Не создан (используется root с ключом) |
| GitHub Secrets | ⚠️ | Нужно добавить вручную |
| SSH password auth | ✅ **ОТКЛЮЧЁН** | Только ключи |
| PermitRootLogin | ✅ | prohibit-password (только ключ) |
| Firewall | ✅ **АКТИВЕН** | UFW: 22, 80, 443 |
| Fail2Ban | ✅ **АКТИВЕН** | SSH jail: 3 попытки → бан 24ч |

## Итерация 2: Выполнено

### ✅ SSH Security

**Файл:** `/etc/ssh/sshd_config.d/security.conf`
```bash
PasswordAuthentication no      # ✅ Отключено
PermitRootLogin prohibit-password  # ✅ Только ключ
PubkeyAuthentication yes        # ✅ Включено
KbdInteractiveAuthentication no # ✅ Отключено
```

### ✅ Firewall (UFW)

```bash
Status: active
22/tcp   ALLOW  # SSH
80/tcp   ALLOW  # HTTP
443/tcp  ALLOW  # HTTPS
Default: deny incoming
```

### ✅ Fail2Ban

```bash
Jail: sshd
- MaxRetry: 3
- BanTime: 24h
- FindTime: 10m
Status: Active
```

### ✅ Monitoring

```bash
/usr/local/bin/server-health.sh  # Health check скрипт
/etc/logrotate.d/docker-compose  # Log rotation
```

### ✅ Backups

```
/root/backup/
├── sshd_config.backup-YYYYMMDD
├── passwd
├── shadow
└── packages-list.txt
```

## Best Practices

### Secrets Management

✅ **DO:**
- Хранить секреты в GitHub Secrets
- Использовать разные пароли для сервисов
- Ротировать ключи регулярно

❌ **DON'T:**
- Коммитить `.env` файлы
- Хранить ключи в репозитории
- Использовать один пароль везде

### SSH Access

✅ **IN USE:**
- SSH ключи (ed25519)
- Отключен password auth
- Root только с ключом

❌ **BLOCKED:**
- Парольная аутентификация
- Keyboard-interactive

### Docker Security

✅ **DO:**
- Ограничивать ресурсы
- Использовать специфичные образы

```yaml
deploy:
  resources:
    limits:
      memory: 4G
```

❌ **DON'T:**
- Запускать как root (когда возможно)
- Использовать `--privileged`

## Monitoring

### Логи

```bash
# Docker логи
docker compose logs -f

# Системные логи
journalctl -u docker -f

# Auth логи (для Fail2Ban)
grep "Failed password" /var/log/auth.log
```

### Аудит

```bash
# Кто подключался по SSH
last

# Fail2Ban статус
fail2ban-client status sshd

# Firewall статус
ufw status verbose
```

## Rollback Commands

| Проблема | Команда |
|----------|---------|
| SSH не работает | `cp /root/backup/sshd_config.backup-* /etc/ssh/sshd_config && systemctl restart sshd` |
| Firewall блокирует | `ufw --force disable` |
| Fail2Ban банит | `fail2ban-client set sshd unbanip IP` |
| Полный откат | Восстановить из `/root/backup/` |

## Checklist перед продом

- [x] SSH password auth отключён
- [x] Firewall активен (UFW)
- [x] Fail2Ban настроен
- [x] Бэкапы созданы
- [ ] GitHub Secrets добавлены (DEPLOY_SSH_KEY, SERVER_HOST, SERVER_USER)
- [ ] `.env` файл настроен на сервере
- [ ] Первый деплой выполнен
- [ ] Health check работает

## Следующие шаги

1. Добавить `DEPLOY_SSH_KEY` в GitHub Secrets (публичный ключ: `~/.ssh/server_deploy.pub`)
2. Настроить `.env` на сервере
3. Первый деплой через GitHub Actions
4. Проверить что всё работает
