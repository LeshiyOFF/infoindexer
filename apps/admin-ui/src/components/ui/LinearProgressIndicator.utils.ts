/**
 * Утилиты для LinearProgressIndicator
 */

/**
 * Форматирует число строк
 */
export function formatRows(count: number): string {
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(1)}M`;
  }
  if (count >= 1_000) {
    return `${(count / 1_000).toFixed(1)}K`;
  }
  return count.toString();
}

/**
 * Форматирует ETA в секундах
 */
export function formatEta(seconds: number): string {
  if (seconds < 60) {
    return `~${seconds} сек`;
  }
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `~${minutes} мин`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `~${hours}ч ${remainingMinutes}мин` : `~${hours}ч`;
}

/**
 * Вычисляет процент из двух значений
 */
export function calculatePercentage(processed: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(100, Math.floor((processed / total) * 100));
}

/**
 * Возвращает CSS класс цвета бара в зависимости от статуса
 */
export function getBarColorClass(status: string): string {
  switch (status) {
    case 'completed':
      return 'bg-black';
    case 'error':
      return 'bg-red-500';
    case 'paused':
    case 'stopping':
      return 'bg-orange-500';
    case 'deleting':
      return 'bg-red-500';
    case 'running':
      return 'bg-black';
    default:
      return 'bg-gray-400';
  }
}

/**
 * Проверяет, нужно ли показывать shimmer анимацию
 */
export function shouldShowShimmer(status: string, percentage: number): boolean {
  return status === 'running' || status === 'stopping';
}

/**
 * Проверяет, нужно ли показывать indeterminate состояние
 */
export function isIndeterminate(status: string): boolean {
  return status === 'stopping' || status === 'deleting';
}
