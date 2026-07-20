export interface TemplatePublishRequest {

    /**
     * Template identifier.
     */
    templateId: string;

    /**
     * Version being published.
     */
    version: string;

    /**
     * Path to the packaged archive.
     */
    packagePath: string;

    /**
     * Registry identifier.
     */
    registryId: string;

}