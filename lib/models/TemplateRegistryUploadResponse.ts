/**
 * Expected JSON response from a remote registry upload.
 */
export interface TemplateRegistryUploadResponse {

    templateId: string;

    version: string;

    /**
     * Public or internal URL for the uploaded package.
     */
    packageUrl?: string;

}