/**
 * JSON-safe InstalledTemplatePackage.
 */
export interface SerializedInstalledTemplatePackage {

    templateId: string;

    version: string;

    installPath: string;

    sha256: string;

    source: string;

    installedAt: string;

}