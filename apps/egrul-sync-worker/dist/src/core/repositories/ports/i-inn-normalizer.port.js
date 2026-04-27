"use strict";
/**
 * Port для нормализации INN в хранилище
 *
 * @remarks
 * Доменный интерфейс для нормализации OpenSanctions ID в INN.
 * Отделяет бизнес-логику от инфраструктуры хранения.
 *
 * Следует Dependency Inversion Principle: зависит от абстракции (Port),
 * а не от конкретной реализации деталей (ClickHouse DEFAULT expression).
 */
Object.defineProperty(exports, "__esModule", { value: true });
