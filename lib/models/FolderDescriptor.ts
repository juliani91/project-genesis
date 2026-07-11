import { GenerationRule } from "./GenerationRule";

export interface FolderDescriptor {
    /**
     * Relative folder path inside the generated project.
     *
     * Examples:
     * docs
     * Planning/Sprints
     * src/components
     */
    path: string;

    /**
     * Optional rules that determine whether this folder
     * participates in generation planning.
     *
     * All rules must evaluate to true.
     */
    rules?: GenerationRule[];
}