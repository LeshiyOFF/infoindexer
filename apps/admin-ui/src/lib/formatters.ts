/**
 * Утилиты форматирования значений
 *
 * @remarks
 * Функции для форматирования дат, чисел и других значений для отображения в UI.
 */

/**
 * Форматирует дату в локальный формат
 *
 * @param iso — ISO строка даты
 * @returns Отформатированная дата или null
 */
export function formatDate(iso?: string): string | null {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return null;
  }
}
