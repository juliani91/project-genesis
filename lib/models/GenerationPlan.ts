import { GeneratedFile } from "./GeneratedFile";
import { GeneratedFolder } from "./GeneratedFolder";

export interface GenerationPlan {
    /**
     * Absolute root directory where the project will be generated.
     */
    outputPath: string;

    /**
     * Folders that will be created.
     */
    folders: readonly GeneratedFolder[];

    /**
     * Files that will be written.
     */
    files: readonly GeneratedFile[];

    /**
     * Timestamp indicating when the plan was created.
     */
    createdAt: Date;
}