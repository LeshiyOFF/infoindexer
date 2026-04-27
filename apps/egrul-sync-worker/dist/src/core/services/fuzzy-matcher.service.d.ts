/**
 * Результат fuzzy matching
 */
export interface FuzzyMatchResult {
    id: string;
    name: string;
    distance: number;
    confidence: number;
}
/**
 * Сервис для нечёткого сопоставления строк (Fuzzy Matching)
 * Использует алгоритм Левенштейна для поиска похожих строк
 */
export declare class FuzzyMatcherService {
    /**
     * Находит лучшее совпадение имени среди кандидатов
     *
     * @param target - Целевая строка для поиска
     * @param candidates - Массив кандидатов с id и name
     * @param maxDistance - Максимальное расстояние Левенштейна
     * @returns Лучший матч или null
     */
    findBestMatch(target: string, candidates: Array<{
        id: string;
        name: string;
    }>, maxDistance?: number): FuzzyMatchResult | null;
    /**
     * Находит все совпадения с дистанцией не выше maxDistance
     *
     * @param target - Целевая строка
     * @param candidates - Массив кандидатов
     * @param maxDistance - Максимальное расстояние
     * @returns Массив результатов отсортированный по дистанции
     */
    findAllMatches(target: string, candidates: Array<{
        id: string;
        name: string;
    }>, maxDistance?: number): FuzzyMatchResult[];
    /**
     * Нормализует строку для сравнения
     */
    private normalizeString;
    /**
     * Вычисляет расстояние Левенштейна между двумя строками
     * Использует оптимизированный алгоритм с O(min(m,n)) памятью
     */
    private levenshteinDistance;
    /**
     * Вычисляет confidence (уверенность) на основе дистанции и длины строки
     *
     * @param distance - Расстояние Левенштейна
     * @param length - Длина строки
     * @returns Confidence от 0.0 до 1.0
     */
    private calculateConfidence;
}
