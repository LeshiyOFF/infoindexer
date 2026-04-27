/**
 * Sanction Types and DTOs
 *
 * Input/Output DTOs для Sanction Aggregate Root
 */

/**
 * Input DTO для создания Sanction
 * Используется для передачи данных от внешних источников (API, parser)
 */
export interface SanctionData {
  readonly id: string;
  readonly inn: string;
  readonly program: string;
  readonly programId: string;
  readonly authority: string;
  readonly country: string;
  readonly startDate: string;
  readonly endDate?: string;
  readonly sourceUrl: string;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}

/**
 * Output DTO для API responses
 * Содержит только простые типы для JSON сериализации
 */
export interface SanctionDTO {
  readonly id: string;
  readonly inn: string;
  readonly program: string;
  readonly programId: string;
  readonly authority: string;
  readonly country: string;
  readonly startDate: string;
  readonly endDate: string | null;
  readonly sourceUrl: string;
  readonly isActive: boolean;
}
