/**
 * Port для работы с телефонами
 *
 * @remarks
 * Определяет контракт для нормализации телефонов.
 * Реализует Dependency Inversion Principle из SOLID.
 */

/**
 * Port для работы с телефонами
 *
 * @remarks
 * Определяет методы для нормализации телефонных номеров.
 */
export interface IPhoneService {
  /**
   * Нормализует телефонный номер к стандартному формату
   *
   * @param phone - Телефонный номер
   * @returns Нормализованный номер в формате +7 (XXX) XXX-XX-XX
   */
  normalize(phone: string): string;

  /**
   * Проверяет валидность длины телефона
   *
   * @param phone - Телефонный номер
   * @returns true если номер имеет достаточную длину
   */
  isValidLength(phone: string): boolean;
}
