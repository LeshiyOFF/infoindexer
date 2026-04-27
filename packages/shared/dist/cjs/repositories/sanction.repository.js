"use strict";
/**
 * Sanction Repository Interface
 *
 * Port (в терминологии Hexagonal Architecture) для работы с санкциями.
 * Содержит только контракт — без реализации.
 *
 * @remarks
 * Repository работает с SanctionRow (внутренний формат) и SanctionDTO (API формат),
 * но НЕ с Domain Entities. Это следует Separation of Concerns.
 */
Object.defineProperty(exports, "__esModule", { value: true });
