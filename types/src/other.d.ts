export interface ISOString {
  /**
   * Default ISO-String representation consisting of YYYY-MM-DD-HH-MM-SS-MS
   * @example "2023-04-01T00:00:00.000Z"
   */
  full: `${number}-${number}-${number}T-${number}Z`;
  /**
   * Simplified ISO-String representation only consisting of YYYY-MM-DD-HH-MM-SS
   * @example "2023-04-01T00:00:00"
   */
  YYYY_MM_DD_HH_MM_SS: `${number}-${number}-${number}T-${number}`;
  /**
   * Simplified ISO-String representation only consisting of YYYY-MM-DD-HH-MM
   * @example "2023-04-01T00:00"
   */
  YYYY_MM_DD_HH_MM: `${number}-${number}-${number}T-${number}`;
  /**
   * Simplified ISO-String representation only consisting of YYYY-MM-DD-HH
   * @example "2023-04-01T:00"
   */
  YYYY_MM_DD_HH: `${number}-${number}-${number}T-${number}`;
  /**
   * Simplified ISO-String representation only consisting of YYYY-MM-DD
   * @example "2023-04-01"
   */
  YYYY_MM_DD: `${number}-${number}-${number}`;
  /**
   * Simplified ISO-String representation only consisting of YYYY-MM
   * @example "2023-04"
   */
  YYYY_MM: `${number}-${number}`;
  /**
   * Simplified ISO-String representation only consisting of YYYY
   * @example "2023"
   */
  YYYY: `${number}`;
}
