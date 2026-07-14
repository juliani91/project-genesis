/**
 * JSON-safe package publish result.
 */
export interface SerializedTemplatePackagePublishResult {

    templateId: string;

    version: string;

    packagePath: string;

    packageSizeBytes: number;

    sha256: string;

    publishedAt: string;

}