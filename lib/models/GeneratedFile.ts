export interface GeneratedFile {

    /**
     * Source template file.
     */
    sourcePath: string;

    /**
     * Absolute destination on disk.
     */
    destinationPath: string;

    /**
     * Relative destination inside the generated project.
     *
     * Example:
     * README.md
     * app/page.tsx
     * src/components/Button.tsx
     */
    relativePath: string;

    /**
     * File contents after variable replacement.
     */
    contents: string;

}