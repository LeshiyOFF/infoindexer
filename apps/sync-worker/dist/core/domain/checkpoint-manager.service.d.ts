/**
 * Менеджер чекпоинтов синхронизации
 *
 * @remarks
 * Domain сервис для управления чекпоинтами.
 * Инкапсулирует логику сохранения, загрузки и верификации.
 * Следует SRP: отвечает только за чекпоинты.
 */
import type { ICheckpointStorage } from '../ports';
import type { IClickHouseStorage } from '../ports';
/**
 * Результат загрузки чекпоинта
 */
export interface ResumeState {
    readonly startFrom: number;
    readonly initialPercentage: number;
    readonly isResuming: boolean;
}
/**
 * Менеджер чекпоинтов синхронизации
 */
export declare class CheckpointManager {
    private readonly checkpoint;
    private readonly storage;
    private readonly checkpointInterval;
    constructor(checkpoint: ICheckpointStorage, storage: IClickHouseStorage);
    /**
     * Загружает чекпоинт или возвращает начальное состояние
     *
     * @remarks
     * Проверяет целостность сохранённого чекпоинта.
     * При коррупции очищает и возвращает начальное состояние.
     */
    loadOrReset(year: number): Promise<ResumeState>;
    /**
     * Сохраняет чекпоинт
     *
     * @remarks
     * Автоматически вычисляет процент и контрольную сумму.
     */
    save(year: number, processedRows: number, totalRows: number): Promise<void>;
    /**
     * Проверяет нужно ли сохранять чекпоинт
     *
     * @remarks
     * Сохраняет каждые N обработанных строк.
     */
    shouldSave(processedRows: number): boolean;
    /**
     * Очищает чекпоинт
     */
    clear(year: number): Promise<void>;
    /**
     * Проверяет валидность контрольной суммы
     *
     * @remarks
     * Сравнивает количество строк в ClickHouse с контрольной суммой.
     */
    private isChecksumValid;
    /**
     * Возвращает начальное состояние (без чекпоинта)
     */
    private freshState;
}
