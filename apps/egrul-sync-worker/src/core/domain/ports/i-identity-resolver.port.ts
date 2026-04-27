/**
 * Port: Identity Resolver (OUTBOUND)
 *
 * @remarks
 * Defines contract for resolving FTM entity IDs to canonical identifiers.
 * Follows Dependency Inversion: infrastructure depends on this port.
 * Follows Interface Segregation: focused on identity resolution only.
 *
 * Resolution path:
 * - FTM company entity ID → INN (canonical company identifier)
 * - FTM person entity ID → Name (canonical person identifier)
 *
 * @see ClickHouseIdentityResolverAdapter for implementation
 */
export interface IIdentityResolverPort {
  /**
   * Resolves a single FTM company ID to INN
   *
   * @param companyId - FTM company entity ID
   * @returns INN or null if not found
   */
  resolveCompanyToInn(companyId: string): Promise<string | null>;

  /**
   * Resolves a single FTM person ID to name
   *
   * @param personId - FTM person entity ID
   * @returns Person name or null if not found
   */
  resolvePersonToName(personId: string): Promise<string | null>;

  /**
   * Batch resolves multiple company and person IDs
   *
   * @param companyIds - Array of FTM company entity IDs
   * @param personIds - Array of FTM person entity IDs
   * @returns Maps of ID to canonical identifier
   *
   * @remarks
   * More efficient than individual lookups. Uses single query with IN clause.
   */
  resolveBatch(
    companyIds: readonly string[],
    personIds: readonly string[]
  ): Promise<{
    companyToInn: ReadonlyMap<string, string>;
    personToName: ReadonlyMap<string, string>;
  }>;
}
