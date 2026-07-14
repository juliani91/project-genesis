/**
 * Describes a validated template directory that should
 * be built into a distributable package.
 */
export interface TemplatePackageBuildRequest {

    /**
     * Absolute path to the template directory.
     */
    templatePath: string;

    /**
     * Absolute path where the ZIP archive should be written.
     */
    packagePath: string;

    /**
     * Whether an existing archive may be replaced.
     */
    overwrite:
        boolean;

}