import { GenerationRule } from "./GenerationRule";

export type FileDescriptorMode =
    | "render"
    | "copy";

export interface FileDescriptor {
    /**
     * Relative path inside the template package's files directory.
     *
     * Example:
     * README.md
     * Docs/ARCHITECTURE.md
     */
    source: string;

    /**
     * Relative destination inside the generated project.
     *
     * Example:
     * README.md
     * Docs/ARCHITECTURE.md
     */
    destination: string;

    /**
     * Defines whether the source file is rendered as text
     * or copied without modification.
     */
    mode: FileDescriptorMode;

    /**
     * Optional rules that determine whether this file
     * participates in generation planning.
     *
     * All rules must evaluate to true.
     */
    rules?: GenerationRule[];
}