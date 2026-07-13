import {
    VersionIssue
} from "./VersionIssue";

export interface VersionReport {

    /**
     * True when no blocking version errors exist.
     */
    compatible: boolean;

    /**
     * Version issues discovered.
     */
    issues:
        readonly VersionIssue[];

}