# Security Checklist

## Текущее состояние (Итерация 1)

| Компонент | Статус | Действие |
|-----------|--------|----------|
| SSH ключи | ✅ | Создан через `setup-server.sh` |
| Deploy пользователь | ✅ | Создан с доступом к docker |
| GitHub Secrets | ⚠️ | Нужно добавить вручную |
| SSH password auth | ⚠️ | Всё ещё включён |
| Firewall | ❌ | Не настроен |
| Fail2Ban | ❌ | Не установлен |

## Итерация 2 (Server Hardening)

### SSH Security

**Файл:** `/etc/ssh/sshd_config`

```bash
# Отключить парольную аутентификацию
PasswordAuthentication no
PermitRootLogin prohibit-password

# Опционально: сменить порт
# Port 2222
```

### Firewall (UFW)

```bash
# Разрешить SSH
ufw allow 22/tcp

# Разрешить HTTP/HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Заблокировать остальное
ufw default deny incoming
ufw enable
```

### Fail2Ban

```bash
# Установить
apt install fail2ban

# Настроить SSH jail
[sshd]
enabled = true
port = 22
maxretry = 5
bantime = 1h
```

## Best Practices

### Secrets Management

✅ **DO:**
- Хранить секреты в GitHub Secrets
- Использовать разные пароли для сервисов
- ротировать ключи регулярно

❌ **DON'T:**
- Коммитить `.env` файлы
- Хранить ключи в репозитории
- Использовать один пароль везде

### SSH Access

✅ **DO:**
- Использовать SSH ключи (ed25519)
- Отключить password auth
- Ограничить пользователей

❌ **DON'T:**
- Разрешать root login с паролем
- Использовать один ключ для всего

### Docker Security

✅ **DO:**
- Запускать от непривилегированного пользователя
- Использовать `--read-only` где возможно
- Ограничивать ресурсы

```yaml
deploy:
  resources:
    limits:
      memory: 4G
```

❌ **DON'T:**
- Запускать как root
- Использовать `--privileged`
- Забывать обновлять образы

## Monitoring

### Логи

```bash
# Docker логи
docker compose logs -f

# Системные логи
journalctl -u docker -f
```

### Аудит

```bash
# Кто подключался по SSH
last

# Failed login attempts
grep "Failed password" /var/log/auth.log
```

## Checklist перед продом

- [ ] Все секреты в GitHub Secrets
- [ ] SSH ключи добавлены
- [ ] `.env` файл настроен на сервере
- [ ] Docker образы приватные
- [ ] Firewall включён
- [ ] Fail2Ban настроен
- [ ] Логи настроены
- [ ] Backup стратегия
