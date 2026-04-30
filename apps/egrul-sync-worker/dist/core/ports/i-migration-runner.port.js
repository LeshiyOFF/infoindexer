"use strict";
/**
 * Port для выполнения миграций ClickHouse
 *
 * @remarks
 * Абстракция над миграциями базы данных.
 * Позволяет применять SQL миграции независимо от реализации.
 *
 * Следует Dependency Inversion Principle: Domain определяет контракт,
 * Infrastructure предоставляет реализацию.
 */
Object.defineProperty(exports, "__esModule", { value: true });
