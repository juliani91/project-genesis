export interface GeneratedFolder {

    /**
     * Absolute destination on disk.
     */
    path: string;

    /**
     * Relative path within the generated project.
     *
     * Example:
     * app/
     * src/components/
     * docs/
     */
    relativePath: string;

}