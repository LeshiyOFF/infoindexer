/**
 * Кнопка отмены операции
 *
 * @remarks
 * Переиспользуемый компонент кнопки отмены с состояниями:
 * - idle: "Отменить"
 * - loading: "Отмена..."
 * - stopping: "Останавливается..."
 * - deleting: "Удаление..."
 */

"use client";

import { memo } from 'react';
import { X, Loader2 } from 'lucide-react';

export type CancelButtonState = 'idle' | 'loading' | 'stopping' | 'deleting';

export interface CancelButtonProps {
  readonly disabled?: boolean;
  readonly state?: CancelButtonState;
  readonly onCancel: () => void;
  readonly className?: string;
  readonly variant?: 'default' | 'compact';
}

/**
 * Возвращает текст для состояния
 */
function getStateText(state: CancelButtonState): string {
  switch (state) {
    case 'loading':
      return 'Отмена...';
    case 'stopping':
      return 'Останавливается...';
    case 'deleting':
      return 'Удаление...';
    default:
      return 'Отменить';
  }
}

/**
 * Возвращает CSS классы для состояния
 */
function getStateClasses(state: CancelButtonState): string {
  const baseClasses = 'font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

  const colorClasses = state === 'idle'
    ? 'text-red-600 hover:text-red-800 hover:bg-red-50'
    : 'text-red-600 cursor-wait opacity-70';  // ← Красная при stopping/deleting

  return `${baseClasses} ${colorClasses}`;
}

/**
 * Кнопка отмены операции
 */
export const CancelButton = memo(function CancelButton({
  disabled = false,
  state = 'idle',
  onCancel,
  className = '',
  variant = 'default'
}: CancelButtonProps) {
  const sizeClasses = variant === 'compact'
    ? 'text-[10px] px-2 py-1 rounded-lg'
    : 'text-xs px-3 py-1.5 rounded-xl';

  const stateClasses = getStateClasses(state);
  const stateText = getStateText(state);
  const isLoading = state === 'stopping' || state === 'deleting';

  return (
    <button
      type="button"
      onClick={onCancel}
      disabled={disabled || isLoading}
      className={`${sizeClasses} ${stateClasses} ${className}`}
      aria-label="Отменить операцию"
    >
      <span className="flex items-center gap-1">
        {isLoading ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
          <X className="w-3 h-3" />
        )}
        {stateText}
      </span>
    </button>
  );
});
