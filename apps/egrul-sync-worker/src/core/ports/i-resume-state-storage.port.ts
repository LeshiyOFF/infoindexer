/**
 * Port для хранения состояния загрузки с поддержкой resume
 *
 * @remarks
 * Абстракция над хранилищем состояния загрузки для HTTP Range resume.
 * Принадлежит слою Ports (Domain Core).
 * Не зависит от конкретных реализаций (Redis, ClickHouse, файловая система).
 *
 * Следует Dependency Inversion Principle: Domain определяет контракт,
 * Infrastructure предоставляет реализацию.
 */

/**
 * Состояние загрузки для resume
 *
 * @remarks
 * Immutable DTO с readonly свойствами.
 * Содержит всю необходимую информацию для возобновления загрузки.
 */
export interface ResumeState {
  /** URL загружаемого ресурса */
  readonly url: string;
  /** Количество уже загруженных байт */
  readonly downloadedBytes: number;
  /** Общий размер файла (0 если неизвестен) */
  readonly totalBytes: number;
  /** ETag для валидации (RFC 7232) */
  readonly etag?: string;
  /** Last-Modified для валидации */
  readonly lastModified?: string;
  /** Timestamp последнего обновления */
  readonly timestamp: number;
}

/**
 * Port для хранения состояния загрузки с поддержкой resume
 *
 * @remarks
 * Позволяет сохранять, загружать и очищать состояние загрузки.
 * Используется для возобновления прерванной загрузки (HTTP Range).
 *
 * @example
 * ```typescript
 * await storage.save(url, {
 *   url,
 *   downloadedBytes: 1024000,
 *   totalBytes: 10240000,
 *   etag: '"33a64df551425fcc55"',
 *   lastModified: 'Wed, 21 Oct 2015 07:28:00 GMT',
 *   timestamp: Date.now()
 * });
 * ```
 */
export interface IResumeStateStorage {
  /**
   * Сохраняет состояние загрузки
   *
   * @param url - URL загружаемого ресурса (ключ)
   * @param state - Состояние загрузки
   */
  save(url: string, state: ResumeState): Promise<void>;

  /**
   * Загружает сохранённое состояние
   *
   * @param url - URL загружаемого ресурса
   * @returns Состояние загрузки или null если не существует
   */
  load(url: string): Promise<ResumeState | null>;

  /**
   * Очищает сохранённое состояние
   *
   * @param url - URL загружаемого ресурса
   */
  clear(url: string): Promise<void>;

  /**
   * Проверяет валидность сохранённого состояния
   *
   * @remarks
   * Сравнивает ETag с текущим значением сервера.
   * Если ETag изменился — состояние устарело (файл изменён).
   *
   * @param url - URL загружаемого ресурса
   * @param currentEtag - Текущий ETag от сервера
   * @returns true если состояние валидно
   */
  isValid(url: string, currentEtag: string): Promise<boolean>;
}
