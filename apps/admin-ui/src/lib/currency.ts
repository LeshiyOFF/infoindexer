/**
 * Утилиты форматирования финансов.
 * RFSD (ГИР БО) хранит суммы в ТЫСЯЧАХ рублей — при отображении умножаем на 1000.
 */

const THOUSANDS_MULT = 1000;

export function toRubles(val: string | number | null | undefined): number {
  const n = typeof val === 'string' ? parseFloat(val) : val;
  return (isNaN(n as number) ? 0 : (n as number)) * THOUSANDS_MULT;
}

export function formatCurrency(val: string | number | null | undefined, fromThousands = false): string {
  if (val === null || val === undefined) return '0 ₽';
  const numVal = fromThousands ? toRubles(val) : (typeof val === 'string' ? parseFloat(val) : val) || 0;
  if (isNaN(numVal)) return '0 ₽';
  const abs = Math.abs(numVal);
  if (abs >= 1_000_000_000_000) return (numVal / 1_000_000_000_000).toFixed(2) + ' трлн ₽';
  if (abs >= 1_000_000_000) return (numVal / 1_000_000_000).toFixed(2) + ' млрд ₽';
  if (abs >= 1_000_000) return (numVal / 1_000_000).toFixed(2) + ' млн ₽';
  if (abs >= 1_000) return (numVal / 1_000).toFixed(0) + ' тыс ₽';
  return numVal.toLocaleString('ru-RU') + ' ₽';
}

/** Сокращённое форматирование чисел (млн, млрд, трлн) для отчётов */
export function formatNumber(val: string | number | null | undefined, fromThousands = false): string {
  if (val === null || val === undefined) return '-';
  const numVal = fromThousands ? toRubles(val) : (typeof val === 'string' ? parseFloat(val) : val);
  if (isNaN(numVal as number)) return '-';
  const n = numVal as number;
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000_000) return (n / 1_000_000_000_000).toFixed(2) + ' трлн ₽';
  if (abs >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2) + ' млрд ₽';
  if (abs >= 1_000_000) return (n / 1_000_000).toFixed(2) + ' млн ₽';
  if (abs >= 1_000) return (n / 1_000).toFixed(0) + ' тыс ₽';
  return n.toLocaleString('ru-RU') + ' ₽';
}

