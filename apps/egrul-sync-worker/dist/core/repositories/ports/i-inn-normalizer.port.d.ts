/**
 * Port для нормализации INN в хранилище
 *
 * @remarks
 * Доменный интерфейс для нормализации OpenSanctions ID в INN.
 * Отделяет бизнес-логику от инфраструктуры хранения.
 *
 * Следует Dependency Inversion Principle: зависит от абстракции (Port),
 * а не от конкретной реализации деталей (ClickHouse DEFAULT expression).
 */
/**
 * Port для нормализации INN
 *
 * @remarks
 * Описывает контракт для нормализации ID в хранилище.
 * Реализация может быть: SQL DEFAULT expression, application code, etc.
 */
export interface IInnNormalizerPort {
    /**
     * Нормализует ID в INN на стороне хранилища
     *
     * @param id - ID из OpenSanctions
     * @returns INN или пустую строку
     */
    normalizeInn(id: string): string;
}
