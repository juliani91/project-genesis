/**
 * Describes a generated template package.
 */
export interface TemplatePackagePublishResult {

    templateId: string;

    version: string;

    packagePath: string;

    packageSizeBytes: number;

    sha256: string;

    publishedAt: Date;

}