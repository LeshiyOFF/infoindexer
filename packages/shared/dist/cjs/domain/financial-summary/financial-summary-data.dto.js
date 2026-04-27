"use strict";
/**
 * Financial Summary Data Transfer Objects
 *
 * @remarks
 * Domain Layer: DTO для передачи данных между слоями.
 * Part of Clean Architecture / Hexagonal Ports & Adapters.
 *
 * Architecture:
 * - *Data интерфейсы: входные данные для VO.create()
 * - *DTO интерфейсы: выходные данные для API response
 * - Не зависят от ClickHouse или других инфраструктурных деталей
 *
 * Iteration 3: CLEAN ARCHITECTURE - убраны company metadata
 * - FinancialSummary содержит только финансовые агрегаты
 * - Company metadata (director, name, status) запрашиваются отдельно
 */
Object.defineProperty(exports, "__esModule", { value: true });
