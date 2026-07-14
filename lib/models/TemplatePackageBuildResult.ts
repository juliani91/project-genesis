import {
    TemplatePackageMetadata
} from "./TemplatePackageMetadata";

/**
 * Represents a successfully built template archive.
 */
export interface TemplatePackageBuildResult {

    /**
     * Absolute path to the source template directory.
     */
    templatePath: string;

    /**
     * Absolute path to the generated archive.
     */
    packagePath: string;

    /**
     * Generated package metadata.
     */
    metadata:
        TemplatePackageMetadata;

}