/**
 * Parse Error Base Class
 *
 * Базовый класс для всех ошибок парсинга.
 */

/**
 * Базовая ошибка парсинга
 */
export class ParseError extends Error {
  readonly category: string;

  constructor(message: string, category: string) {
    super(message);
    this.name = 'ParseError';
    this.category = category;
    Object.setPrototypeOf(this, ParseError.prototype);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      category: this.category
    };
  }
}
