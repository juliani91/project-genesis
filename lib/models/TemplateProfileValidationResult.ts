export interface TemplateProfileValidationResult {

    /**
     * True when no validation errors exist.
     */
    valid: boolean;

    /**
     * Human-readable validation errors.
     */
    errors:
        readonly string[];

}