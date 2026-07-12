export interface ComputedVariable {
    /**
     * Variable key added to the VariableCollection.
     *
     * Examples:
     * PROJECT_SLUG
     * CREATED_DATE
     * CURRENT_YEAR
     */
    key: string;

    /**
     * Computed variable value.
     */
    value: string;
}