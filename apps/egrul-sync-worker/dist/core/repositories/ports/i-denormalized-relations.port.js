"use strict";
/**
 * Port для работы с денормализованными связями EGRUL
 *
 * @remarks
 * Доменный интерфейс для управления pre-aggregated данными о директорах и владельцах.
 * Denormalization shift computational work from query time to insert/pre-processing time.
 *
 * Следует Dependency Inversion Principle: зависит от абстракции (Port),
 * а не от конкретной реализации деталей.
 */
Object.defineProperty(exports, "__esModule", { value: true });
