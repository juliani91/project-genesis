/**
 * Represents a successful registry package upload.
 */
export interface TemplateRegistryUploadResult {

    templateId: string;

    version: string;

    uploadUrl: string;

    statusCode: number;

    uploadedAt: Date;

    /**
     * Optional package URL returned by the registry.
     */
    packageUrl?: string;

}