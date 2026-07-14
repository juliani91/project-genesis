/**
 * Describes a template package that should be uploaded
 * to a remote registry.
 */
export interface TemplateRegistryUploadRequest {

    /**
     * Registry endpoint that accepts package uploads.
     */
    uploadUrl: string;

    /**
     * Absolute path to the ZIP package.
     */
    packagePath: string;

    /**
     * Template identifier.
     */
    templateId: string;

    /**
     * Template version.
     */
    version: string;

    /**
     * Lowercase SHA-256 checksum.
     */
    sha256: string;

    /**
     * Optional bearer token.
     */
    accessToken?: string;

}