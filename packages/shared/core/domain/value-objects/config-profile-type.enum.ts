/**
 * Configuration Profile Type enum
 *
 * @remarks
 * Extracted to avoid circular dependency between
 * config-profile.vo.ts and config-profile.constants.ts
 */
export enum ConfigProfileType {
  LOW = 'low',
  STANDARD = 'standard',
  HIGH = 'high'
}
