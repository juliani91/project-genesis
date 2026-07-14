/**
 * Result of verifying a downloaded template archive.
 */
export interface TemplatePackageIntegrityResult {

    /**
     * Absolute path of the verified archive.
     */
    archivePath: string;

    /**
     * Calculated lowercase SHA-256 value.
     */
    actualSha256: string;

    /**
     * Advertised lowercase SHA-256 value, when provided.
     */
    expectedSha256?: string;

    /**
     * True when no expected checksum exists or the values match.
     */
    valid: boolean;

    /**
     * True when an expected checksum was supplied.
     */
    verified: boolean;

}