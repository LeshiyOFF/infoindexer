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
export class FuzzyMatcherService {
  /**
   * Находит лучшее совпадение имени среди кандидатов
   *
   * @param target - Целевая строка для поиска
   * @param candidates - Массив кандидатов с id и name
   * @param maxDistance - Максимальное расстояние Левенштейна
   * @returns Лучший матч или null
   */
  findBestMatch(
    target: string,
    candidates: Array<{ id: string; name: string }>,
    maxDistance = 3
  ): FuzzyMatchResult | null {
    if (!target || candidates.length === 0) {
      return null;
    }

    const normalizedTarget = this.normalizeString(target);
    let bestMatch: FuzzyMatchResult | null = null;

    for (const candidate of candidates) {
      const normalizedCandidate = this.normalizeString(candidate.name);
      const distance = this.levenshteinDistance(normalizedTarget, normalizedCandidate);

      if (distance <= maxDistance) {
        const confidence = this.calculateConfidence(distance, normalizedTarget.length);

        if (!bestMatch || distance < bestMatch.distance) {
          bestMatch = {
            id: candidate.id,
            name: candidate.name,
            distance,
            confidence
          };

          // Идеальное совпадение - можно прервать поиск
          if (distance === 0) {
            break;
          }
        }
      }
    }

    return bestMatch;
  }

  /**
   * Находит все совпадения с дистанцией не выше maxDistance
   *
   * @param target - Целевая строка
   * @param candidates - Массив кандидатов
   * @param maxDistance - Максимальное расстояние
   * @returns Массив результатов отсортированный по дистанции
   */
  findAllMatches(
    target: string,
    candidates: Array<{ id: string; name: string }>,
    maxDistance = 3
  ): FuzzyMatchResult[] {
    if (!target || candidates.length === 0) {
      return [];
    }

    const normalizedTarget = this.normalizeString(target);
    const results: FuzzyMatchResult[] = [];

    for (const candidate of candidates) {
      const normalizedCandidate = this.normalizeString(candidate.name);
      const distance = this.levenshteinDistance(normalizedTarget, normalizedCandidate);

      if (distance <= maxDistance) {
        results.push({
          id: candidate.id,
          name: candidate.name,
          distance,
          confidence: this.calculateConfidence(distance, normalizedTarget.length)
        });
      }
    }

    return results.sort((a, b) => a.distance - b.distance);
  }

  /**
   * Нормализует строку для сравнения
   */
  private normalizeString(str: string): string {
    return str
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[ёЁ]/g, 'е')
      .replace(/[^а-яa-z0-9\s]/g, '');
  }

  /**
   * Вычисляет расстояние Левенштейна между двумя строками
   * Использует оптимизированный алгоритм с O(min(m,n)) памятью
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const m = str1.length;
    const n = str2.length;

    if (m === 0) return n;
    if (n === 0) return m;

    // Используем меньший размер для массива
    if (m < n) {
      return this.levenshteinDistance(str2, str1);
    }

    let prevRow = new Array(n + 1).fill(0);
    let currRow = new Array(n + 1).fill(0);

    // Инициализация первой строки
    for (let i = 0; i <= n; i++) {
      prevRow[i] = i;
    }

    for (let i = 1; i <= m; i++) {
      currRow[0] = i;

      for (let j = 1; j <= n; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        currRow[j] = Math.min(
          currRow[j - 1] + 1,      // вставка
          prevRow[j] + 1,         // удаление
          prevRow[j - 1] + cost   // замена
        );
      }

      // Обмен строк
      [prevRow, currRow] = [currRow, prevRow];
    }

    return prevRow[n];
  }

  /**
   * Вычисляет confidence (уверенность) на основе дистанции и длины строки
   *
   * @param distance - Расстояние Левенштейна
   * @param length - Длина строки
   * @returns Confidence от 0.0 до 1.0
   */
  private calculateConfidence(distance: number, length: number): number {
    if (distance === 0) return 1.0;
    if (length === 0) return 0.0;

    // Чем больше длина строки, тем меньше штраф за единицу дистанции
    const normalizedDistance = distance / length;
    return Math.max(0, 1 - normalizedDistance);
  }
}
