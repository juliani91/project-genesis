export type CompatibilityIssueType =
    | "missing-capability"
    | "conflict";

export interface CompatibilityIssue {

    /**
     * Type of compatibility issue.
     */
    type:
        CompatibilityIssueType;

    /**
     * Human-readable explanation.
     */
    message: string;

    /**
     * Related capability.
     */
    capability: string;

    /**
     * Template responsible for the issue.
     */
    templateId: string;

}