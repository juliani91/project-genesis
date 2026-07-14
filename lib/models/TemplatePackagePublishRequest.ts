/**
 * Describes a template package that should be
 * published to a registry.
 */
export interface TemplatePackagePublishRequest {

    /**
     * Absolute path to the template directory.
     */
    templatePath: string;

    /**
     * Output directory where the package should be built.
     */
    outputDirectory: string;

    /**
     * True to overwrite an existing package.
     */
    overwrite?: boolean;

}