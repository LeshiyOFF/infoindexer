/**
 * Утилита для создания задержки
 *
 * @remarks
 * Переиспользуемая функция delay для использования в сервисах.
 */

/**
 * Создаёт задержку на указанное количество миллисекунд
 *
 * @param ms - Задержка в миллисекундах
 * @returns Promise, который резолвится после задержки
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
