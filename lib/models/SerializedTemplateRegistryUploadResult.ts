/**
 * JSON-safe registry upload result.
 */
export interface SerializedTemplateRegistryUploadResult {

    templateId: string;

    version: string;

    uploadUrl: string;

    statusCode: number;

    uploadedAt: string;

    packageUrl?: string;

}