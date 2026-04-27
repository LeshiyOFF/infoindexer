/**
 * Value Object для нормализации INN
 *
 * @remarks
 * Выделяет INН из OpenSanctions ID формата "ru-inn-{INN}".
 * Pure function - без side effects, без зависимостей от инфраструктуры.
 *
 * Следует SRP: единственная ответственность - нормализация ID.
 *
 * Алгоритм O(1): position() проверяет префикс, substring() извлекает значение.
 */

/**
 * Value Object для нормализации INN
 */
export class InnNormalizer {
  private static readonly RU_INN_PREFIX = 'ru-inn-';
  private static readonly PREFIX_LENGTH = 7; // "ru-inn-".length
  private static readonly INN_START_INDEX = 8; // После префикса

  /**
   * Нормализует ID в INN
   *
   * @param id - ID из OpenSanctions (формата "ru-inn-{INN}" или entity UUID)
   * @returns INН или пустую строку если ID не соответствует формату
   *
   * @remarks
   * Алгоритм:
   * 1. Проверяет что ID начинается с "ru-inn-"
   * 2. Извлекает подстроку начиная с 8-го символа
   * 3. Возвращает пустую строку для non-INN ID
   *
   * Сложность: O(1) - проверка префикса + извлечение подстроки
   */
  static normalizeInn(id: string): string {
    if (!id || id.length <= this.PREFIX_LENGTH) {
      return '';
    }

    // Проверяем префикс "ru-inn-" в начале строки
    const hasPrefix = id.startsWith(this.RU_INN_PREFIX);

    if (!hasPrefix) {
      return '';
    }

    // Извлекаем INН после префикса (substring - O(1) операция)
    return id.substring(this.INN_START_INDEX);
  }

  /**
   * Проверяет что ID соответствует формату INN
   *
   * @param id - ID для проверки
   * @returns true если ID начинается с "ru-inn-"
   */
  static isInnFormat(id: string): boolean {
    return id?.startsWith(this.RU_INN_PREFIX) ?? false;
  }
}
