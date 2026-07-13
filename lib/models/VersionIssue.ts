export type VersionIssueType =
    | "engine-too-old"
    | "engine-too-new"
    | "template-version"
    | "deprecated";

export interface VersionIssue {

    /**
     * Type of version issue.
     */
    type: VersionIssueType;

    /**
     * Template producing the issue.
     */
    templateId: string;

    /**
     * Human-readable description.
     */
    message: string;

    /**
     * True when generation may continue.
     */
    warning: boolean;

}