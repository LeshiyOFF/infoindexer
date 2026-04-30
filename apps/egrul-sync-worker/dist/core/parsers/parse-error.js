"use strict";
/**
 * Parse Error Base Class
 *
 * Базовый класс для всех ошибок парсинга.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParseError = void 0;
/**
 * Базовая ошибка парсинга
 */
class ParseError extends Error {
    category;
    constructor(message, category) {
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
exports.ParseError = ParseError;
