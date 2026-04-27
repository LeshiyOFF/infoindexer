"use strict";
/**
 * Port для хранения состояния загрузки с поддержкой resume
 *
 * @remarks
 * Абстракция над хранилищем состояния загрузки для HTTP Range resume.
 * Принадлежит слою Ports (Domain Core).
 * Не зависит от конкретных реализаций (Redis, ClickHouse, файловая система).
 *
 * Следует Dependency Inversion Principle: Domain определяет контракт,
 * Infrastructure предоставляет реализацию.
 */
Object.defineProperty(exports, "__esModule", { value: true });
