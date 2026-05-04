# POST-IDENTITY PIPELINE — план фикса для следующей сессии

## TL;DR

Pipeline EGRUL завершается успешно по логам, но `companies_production`, `directors_production`, `founders_production` остаются пустыми. Причина: миграция 021 заложила архитектуру (staging → transform → production), новый код для этой архитектуры написан (`EgrulTransformService`, `MVInsertAdapter`), но **не подключён к SyncOrchestrator**. Старые handlers (`Denormalization`, `Merger`) переведены в NO-OP, новые handlers не созданы. Обнаружено 4 мая 2026 во время полного успешного прохождения остальных стадий.

## 1. Эволюция архитектуры (контекст)

История изменений по миграциям:

**До миграции 015.** Использовалась схема: `parsing → egrul_companies_raw → companies_meta` (через прямые SELECT-запросы).

**Миграция 015.** Создала первый набор Materialized Views: `companies_mv`, `directors_mv`, `founders_mv`. MV должны были автоматически агрегировать данные из `_raw` таблиц.

**Миграция 016.** Создала staging-таблицы: `egrul_staging_companies`, `egrul_staging_directorships`, `egrul_staging_ownerships`.

**Миграция 017 (критичная).** Удалила MV, потому что AggregatingMergeTree вызывал OOM при ~1M записей. После этого `companies_meta` стал недоступен. В коментариях миграции написано: "Will be restored in Migration 021 after Transform Service".

**Миграция 018.** Создала production-таблицы: `companies_production`, `directors_production`, `founders_production`.

**Миграция 019.** Инициализировала `egrul_transform_state` для отслеживания статуса трансформации.

**Миграция 021.** Переключение на staging+transform pattern. Что должна была сделать (по комментариям в SQL):

- Phase 1: мигрировать существующие данные из `_raw` в production.
- Phase 2: создать `companies_meta` VIEW на production-таблицах.
- Phase 3: опционально очистить `_raw` таблицы.

Что НЕ сделала: не создала handlers для transform stage в SyncOrchestrator, не подключила `EgrulTransformService` к sync flow.

## 2. Текущее состояние SyncOrchestrator

Orchestrator выполняет handlers по порядку:

```
1. IdentityMappingHandler   ✅ Реальная работа: identityMapping.build(mode)
2. DenormalizationHandler   ❌ NO-OP: только clear() + deprecation logs
3. EnrichmentHandler        ⚠️ Conditional: if (enableEnrichment) → enrichUnmappedInns()
4. MergerHandler            ❌ NO-OP: "MV auto-update enabled (no merge needed)"
5. CleanupHandler           ⚠️ Cleanup: repository.cleanupRawTables()
```

Все handlers вызываются и пишут "Completed stage: X" в логи, но реальную работу делает только `IdentityMappingHandler`. Сообщение `MergerHandler` про "MV auto-update enabled" — **ложь**: MV для EGRUL были удалены в миграции 017 и не пересоздавались.

## 3. Существующие но не подключённые компоненты

### EgrulTransformService

Файл: `apps/egrul-sync-worker/src/core/services/egrul-transform.service.ts`

Публичные методы:

- `transformIfNeeded(): Promise<TransformResult[]>` — проверяет порог и запускает transform.
- `transformTable(tableName: string): Promise<TransformResult>` — выполняет transform одной таблицы.
- `getTransformStatus(): Promise<TransformTableStatus[]>` — возвращает статус.
- `resetTransform(tableName: string): Promise<void>` — сброс.

Приватный метод `aggregateAndInsert` маршрутизирует:

```
COMPANIES     → aggregateCompanies     → companies_production
DIRECTORSHIPS → aggregateDirectors     → directors_production
OWNERSHIPS    → aggregateFounders      → founders_production
```

Источник: `egrul_staging_*` таблицы. Назначение: `*_production`.

Текущее использование: вызывается только из `TransformPollingWorker`, который сам не интегрирован в sync flow и **никогда не запускал transform** (см. документ `TRANSFORM_POLLING_BROKEN.md` про баг с `last_staging_count`).

### MVInsertAdapter

Файл: `apps/egrul-sync-worker/src/core/infrastructure/adapters/mv-insert.adapter.ts`

Публичные методы:

- `insertDirectors(directors, ...): Promise<MVInsertResult>`
- `insertFounders(founders, ...): Promise<MVInsertResult>`
- `insertAll(directors, founders, ...): Promise<{...}>`

Источник: массивы `EgrulDirectorRow[]`, `EgrulFounderRow[]` (in-memory).
Назначение: `egrul_directors_denormalized`, `egrul_founders_denormalized`.

Текущее использование: **никто не вызывает**. Упоминается только в deprecation-логах `DenormalizationHandler`.

## 4. Что нужно сделать

### Шаг 1. Создать TransformHandler (или переписать существующий handler)

Новый handler в orchestrator chain между `IdentityMapping` и `Denormalization` (или вместо `Denormalization`):

```typescript
class TransformHandler implements ISyncStageHandler {
  readonly stageName = 'transform';
  
  constructor(private readonly transformService: ITransformService) {}
  
  async execute(context: SyncStageContext): Promise<void> {
    const results = await this.transformService.transformAll();
    // Логирование результатов
  }
}
```

**Открытый вопрос для проектирования:** в `EgrulTransformService` метода `transformAll()` нет, есть `transformIfNeeded()` (зависит от порога) и `transformTable(name)` (одна таблица). Нужно либо добавить `transformAll()`, либо в handler'е последовательно вызывать `transformTable` для трёх таблиц (`companies`, `directorships`, `ownerships`).

**Риск:** мы не знаем, корректно ли работает `transformTable()` сам по себе. Метод никогда не запускался end-to-end в production (был известный баг с `last_staging_count` в polling worker, который блокировал любой запуск). При первом реальном запуске может вылезти ещё один слой багов.

### Шаг 2. Решить судьбу DenormalizationHandler и MergerHandler

Два варианта:

**Вариант A.** Удалить оба handler (они NO-OP, занимают место, вводят в заблуждение). Чище, но требует правки orchestrator constructor / DI configuration.

**Вариант B.** Оставить deprecated handlers, но изменить их логи: убрать "Completed stage" — оно ложное. Заменить на "[DEPRECATED] Stage X is no-op since migration 021". Менее инвазивно.

**Рекомендация:** Вариант A после того, как новый TransformHandler доказан рабочим.

### Шаг 3. Решить, нужен ли MVInsertAdapter

Этот компонент работает с denormalized таблицами (`egrul_directors_denormalized`, `egrul_founders_denormalized`). По миграции 021 эти таблицы могут быть legacy — сейчас данные должны идти прямо в `*_production` через `EgrulTransformService`.

Проверить:

- Используется ли `egrul_directors_denormalized` где-нибудь в downstream-коде (companies_meta VIEW, API queries)?
- Если нет — MVInsertAdapter и связанные таблицы можно удалить как legacy.
- Если да — нужно понять, кто и когда должен туда писать.

### Шаг 4. Проверить EnrichmentHandler

Сейчас он conditional (`if (enableEnrichment)`). Узнать:

- Где в конфигурации задаётся `enableEnrichment` (env переменная? настройка?).
- Что он реально делает, когда включён.
- Должен ли он работать после transform (в правильном порядке)?

### Шаг 5. Проверить CleanupHandler

Сейчас он вызывает `cleanupRawTables()`. После миграции 021 это, возможно, ещё нужно (для удаления legacy `_raw` данных), а возможно нет. Проверить:

- Какие таблицы он чистит сейчас?
- Должен ли он чистить staging-таблицы после успешного transform (как обычно делают в transform-pattern)?
- Не очищает ли он что-то нужное?

### Шаг 6. Проверить и пересоздать companies_meta VIEW

Миграция 021 должна была создать `companies_meta` VIEW на production-таблицах. Проверить:

- Существует ли этот VIEW?
- Если да — что он возвращает (production пустой → VIEW тоже пустой)?
- Если нет — миграция 021 не довела дело до конца, нужно создать VIEW вручную.

## 5. Предлагаемый порядок реализации

1. **Диагностика:** проверить состояние `companies_meta`, использование `egrul_*_denormalized` таблиц в downstream-коде.
2. **Прототип TransformHandler:** написать handler, протестировать ручным вызовом без интеграции в orchestrator.
3. **Тестирование `transformTable()`:** убедиться, что метод корректно работает на одной таблице (например, `companies`). Возможны ошибки (метод никогда не запускался).
4. **Интеграция в orchestrator:** добавить TransformHandler в цепочку.
5. **End-to-end тест:** запустить полный pipeline EGRUL, убедиться что production-таблицы заполняются.
6. **Cleanup:** удалить deprecated handlers, обновить документацию.

Не пытаться сделать всё сразу. Каждый шаг — отдельный коммит. Между шагами — verification.

## 6. Что проверить ПЕРЕД исправлением

Эти проверки обязательны для корректного фикса:

**Проверка 1.** Где в downstream-коде используется `companies_production`, `directors_production`, `founders_production`. Если код API ожидает данные оттуда — это правильное назначение для transform.

**Проверка 2.** Где в downstream-коде используется `egrul_directors_denormalized`, `egrul_founders_denormalized`. Если нигде — это legacy, можно игнорировать. Если используется — это альтернативный путь, который тоже должен работать.

**Проверка 3.** Состояние `companies_meta` VIEW в production-БД.

**Проверка 4.** Полный код метода `transformTable()` в `EgrulTransformService`. Никогда не запускался — может содержать баги.

**Проверка 5.** Полный код метода `aggregateCompanies`, `aggregateDirectors`, `aggregateFounders`. Это та логика, которая должна писать в production. Никогда не выполнялась.

## 7. Чего НЕ делать при исправлении

1. **Не пересоздавать MV.** Миграция 017 убрала их по конкретной причине (OOM на 1M записей). Возвращать MV — значит возвращать OOM. Только transform-based подход.

2. **Не делать "одной правкой везде".** Каждое из изменений (создание TransformHandler, удаление deprecated, проверка enrichment) — отдельная задача с отдельным тестированием.

3. **Не считать `transformTable()` рабочим, пока не протестировано.** Метод никогда не запускался end-to-end.

4. **Не удалять `EgrulTransformService` или `MVInsertAdapter`** без полного понимания их роли. Они написаны намеренно, и удалять их вслепую — значит терять задумку оригинального автора.

5. **Не разворачивать pipeline на тестовом запуске EGRUL без подготовленного мониторинга.** Полный re-parse архива занимает 30-40 минут, ошибка на финальном этапе — потеря этого времени.

## 8. Связь с другими известными проблемами

- **TransformPollingWorker** (см. `TRANSFORM_POLLING_BROKEN.md`): сломан баг с `last_staging_count`. Но даже после фикса этого бага polling worker делает то же самое, что новый TransformHandler сделает в orchestrator chain. После создания TransformHandler решение про polling worker нужно пересмотреть — возможно, его можно удалить как избыточный.

- **Companies date format fix** (коммит `e6b7ec5`): completed, не блокирует transform.

- **Identity-mapping fix** (коммит `6551e18`): completed. Identity-mapping таблица заполнена, transform может её использовать как resolution lookup, если нужно.

## 9. Почему этот документ написан, а фикс не сделан в той же сессии

Сессия 4 мая 2026 шла 9+ часов. Были сделаны и подтверждены пять фиксов:

1. ClickHouse memory limits (`d43a052`).
2. Worker 2GB guard (`3248f79`).
3. Worker NODE_OPTIONS heap (`1726eaa`).
4. Companies DateTime64 format (`e6b7ec5`).
5. Identity-mapping `_raw → _staging` (`6551e18`).

К моменту обнаружения post-identity pipeline проблемы силы для качественного решения архитектурной задачи такого масштаба исчерпались. Реализация без полной диагностики риск создать скрытые баги, которые будет сложнее отлаживать в следующей сессии. Документ-план позволяет следующей сессии начать сразу с реализации, не теряя время на восстановление контекста.

---

## 10. Дополнительная диагностика 4 мая 2026 (вечер)

После создания первой версии документа была сделана глубокая диагностика структуры данных staging-таблиц для проектирования семантически корректного TransformHandler. Обнаружены критические ограничения, которые меняют объём работы.

### 10.1. Структура id-полей в staging

В `egrul_staging_directorships`:
- `director_id` имеет формат `ru-inn-XXXXXXXXXX` (ИНН физического лица как часть ID)
- `organization_id` аналогично содержит ИНН организации

В `egrul_staging_ownerships`:
- `owner_id` имеет формат `ru-XXXXXXXX...` (UUID, не ИНН)
- `asset_id` содержит ИНН организации

Это КЛЮЧЕВОЕ различие: директора идентифицируются через ИНН, владельцы — через UUID.

### 10.2. Возможность resolution через JOIN со staging_companies

Тестовый запрос со staging_companies показал:

| Метрика | Directors | Founders (Owners) |
|---------|-----------|-------------------|
| Всего записей | 12.6M | 13.9M |
| Уникальных ID | 7.8M | 8.1M |
| Резолвится в staging_companies | ~5.55M | 0 |
| Процент resolution | **~71%** | **0%** |

### 10.3. Корневая причина

Парсер `entity-parser.service.ts` фильтрует FTM-сущности по наличию ИНН (`parseStagingCompany` возвращает null если `inn` пустой). В результате:

- Person-сущности с ИНН попадают в `egrul_staging_companies`. Это позволяет резолвить директоров (у которых `id` содержит ИНН).
- Person и Company сущности БЕЗ ИНН (или не парсящиеся как ИНН) — не попадают никуда. Это все владельцы (`owner_id` = UUID) и часть директоров (~29%).

### 10.4. Что это значит для расширенной схемы

Расширенная схема (с `inn` директора/владельца):
- Для **71% директоров** возможна — есть и имя, и ИНН
- Для **29% директоров** — null или UUID
- Для **100% владельцев** — null или UUID, имени нет

Production-таблица `founders_production` при текущем парсере неизбежно будет содержать только UUID без имён. Это семантически плохо для downstream-задач (поиск по имени владельца, аналитика собственников).

### 10.5. Полный список того, что нужно сделать для семантически корректного pipeline

Помимо шагов из секций 4-5 этого документа, добавляются:

**Шаг 0 (новый, ДО всех остальных):** Доработка парсера.
- Изменить `parseStagingCompany` / `parseCompany` — сохранять все Person и Company сущности, не только с ИНН.
- Возможно, создать отдельную таблицу `egrul_staging_entities` для сущностей без ИНН.
- Адаптировать схему таблиц (добавить поле для UUID, сделать ИНН nullable).
- Обновить миграции.
- Полный re-parse архива EGRUL для накопления данных.

**Шаг 1 (новый):** Миграция схемы production-таблиц.
- Добавить колонки `director_inn` в `directors_production`.
- Добавить колонки `founder_inn` в `founders_production`.
- Возможно, добавить `director_name_uuid` и `founder_uuid` для случаев без ИНН.

Только после Шагов 0 и 1 имеет смысл делать TransformHandler.

### 10.6. Альтернативы (если не делать полное решение)

**Минимальный фикс (НЕ рекомендуется).** TransformHandler с текущей схемой и текущими aggregators. Production-таблицы заполнятся семантически плохими данными (UUID/ИНН вместо имён). Pipeline формально работает, downstream-API возвращают бессмысленные ID-строки.

**Частичный фикс.** Расширенная схема только для директоров (где resolution возможен на 71%). Для владельцев оставить как есть (UUID без resolution). Получаем семантически корректные данные для директоров, плохие для владельцев. Это асимметричное решение, которое потом всё равно придётся доделывать.

**Полное решение.** Изменения в парсере + миграция схемы + TransformHandler. Многодневная работа. Семантически корректные данные для всех сущностей.

### 10.7. Рекомендация

В следующей сессии сначала принять архитектурное решение по объёму работы (минимальный / частичный / полный), затем реализовать выбранный вариант. Не пытаться сделать всё за одну сессию.

---

Документ создан 4 мая 2026 после полной диагностики post-identity pipeline. Обновлён 4 мая 2026 (вечер) после дополнительной диагностики структуры данных. Связанные документы: `TRANSFORM_POLLING_BROKEN.md`, коммиты сессии в `Plans/HANDOFF_OOM_FIX_2026_05_01.md`.
