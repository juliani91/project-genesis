export interface RenderedContent {
    /**
     * Prepared file contents.
     *
     * Text files use string.
     * Binary files use Buffer.
     */
    contents: string | Buffer;

    /**
     * Variables that remained unresolved after rendering.
     *
     * Copy-mode files always return an empty array.
     */
    unresolvedVariables: readonly string[];
}