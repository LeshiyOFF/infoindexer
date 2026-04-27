/**
 * Parse Error Base Class
 *
 * Базовый класс для всех ошибок парсинга.
 */
/**
 * Базовая ошибка парсинга
 */
export declare class ParseError extends Error {
    readonly category: string;
    constructor(message: string, category: string);
    toJSON(): {
        name: string;
        message: string;
        category: string;
    };
}
