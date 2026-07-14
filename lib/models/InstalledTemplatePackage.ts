/**
 * Represents a template package installed on the local machine.
 */
export interface InstalledTemplatePackage {

    /**
     * Template identifier.
     */
    templateId: string;

    /**
     * Installed version.
     */
    version: string;

    /**
     * Absolute installation directory.
     */
    installPath: string;

    /**
     * SHA-256 checksum of the installed package.
     */
    sha256: string;

    /**
     * Registry or source URL.
     */
    source: string;

    /**
     * Installation timestamp.
     */
    installedAt: Date;

}