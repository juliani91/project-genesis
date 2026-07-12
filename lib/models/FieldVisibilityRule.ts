export interface FieldVisibilityRule {
    /**
     * Key of a previously answered wizard field.
     *
     * Example:
     * USE_DATABASE
     */
    variable: string;

    /**
     * Value required for the dependent field to be visible.
     *
     * Example:
     * true
     * postgres
     */
    equals: string;
}