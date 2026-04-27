/**
 * Sanction API Types
 *
 * API контракты для работы с санкциями.
 * Использует ApiResponse для типизированных ответов.
 */
import type { SanctionDTO } from '../domain/entities';
import type { ApiResponse, PaginatedResponse } from './responses';
/**
 * Request параметры для поиска санкций по ИНН
 */
export interface GetSanctionsByInnRequest {
    readonly inn: string;
}
/**
 * Response с санкциями по ИНН
 */
export type GetSanctionsByInnResponse = ApiResponse<readonly SanctionDTO[]>;
/**
 * Request параметры для пакетного поиска санкций
 */
export interface GetSanctionsBatchRequest {
    readonly inns: readonly string[];
}
/**
 * Response для пакетного поиска
 */
export type GetSanctionsBatchResponse = ApiResponse<Readonly<Record<string, readonly SanctionDTO[]>>>;
/**
 * Request параметры для пагинационного списка
 */
export interface GetSanctionsListRequest {
    readonly page: number;
    readonly pageSize: number;
    readonly country?: string;
    readonly program?: string;
    readonly activeOnly?: boolean;
}
/**
 * Response с пагинацией
 */
export type GetSanctionsListResponse = PaginatedResponse<SanctionDTO>;
/**
 * Статистика по санкциям
 */
export interface SanctionStatsDTO {
    readonly total: number;
    readonly active: number;
    readonly byCountry: Readonly<Record<string, number>>;
    readonly byProgram: Readonly<Record<string, number>>;
}
/**
 * Response для статистики
 */
export type GetSanctionStatsResponse = ApiResponse<SanctionStatsDTO>;
/**
 * Request для удаления санкций по ИНН
 */
export interface DeleteSanctionsRequest {
    readonly inn: string;
}
/**
 * Response для удаления
 */
export type DeleteSanctionsResponse = ApiResponse<{
    readonly deleted: number;
}>;
/**
 * Проверка наличия санкций
 */
export interface CheckSanctionsRequest {
    readonly inn: string;
}
/**
 * Response для проверки
 */
export type CheckSanctionsResponse = ApiResponse<{
    readonly hasSanctions: boolean;
    readonly count: number;
}>;
