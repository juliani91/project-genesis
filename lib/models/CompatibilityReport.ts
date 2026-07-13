import {
    CompatibilityIssue
} from "./CompatibilityIssue";

export interface CompatibilityReport {

    /**
     * True when no compatibility issues exist.
     */
    compatible: boolean;

    /**
     * Validation results.
     */
    issues:
        readonly CompatibilityIssue[];

}