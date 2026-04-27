/**
 * Shared Status Helpers для Batch
 *
 * @remarks
 * DRY: переиспользуемые функции для работы со статусами батчей.
 * Используется в компонентах и сервисах.
 */

import type { BatchStatus } from '@/components/batches/ports';

/** Возвращает читаемую метку статуса */
export function getStatusLabel(status: BatchStatus): string {
  const labels: Record<BatchStatus, string> = {
    completed: 'Завершено',
    running: 'В работе',
    error: 'Ошибка',
    pending: 'Ожидание',
    idle: 'Ожидание'
  };
  return labels[status] ?? status;
}

/** Возвращает CSS классы для badges статуса */
export function getStatusBadgeClass(status: BatchStatus): string {
  const classes: Record<BatchStatus, string> = {
    completed: 'bg-gray-200 text-gray-800',
    running: 'bg-gray-100 text-gray-700',
    error: 'bg-gray-100 text-gray-700',
    pending: 'bg-gray-100 text-gray-600',
    idle: 'bg-gray-100 text-gray-600'
  };
  return classes[status] ?? 'bg-gray-100 text-gray-600';
}

/** Вычисляет процент выполнения */
export function getProgressPercentage(completed: number, total: number): number {
  return total > 0 ? Math.round((completed / total) * 100) : 0;
}
