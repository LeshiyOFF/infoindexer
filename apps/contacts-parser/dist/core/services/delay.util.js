"use strict";
/**
 * Утилита для создания задержки
 *
 * @remarks
 * Переиспользуемая функция delay для использования в сервисах.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.delay = delay;
/**
 * Создаёт задержку на указанное количество миллисекунд
 *
 * @param ms - Задержка в миллисекундах
 * @returns Promise, который резолвится после задержки
 */
function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
