export interface WizardAnswer {
    /**
     * Key of the wizard field being answered.
     *
     * Examples:
     * PROJECT_NAME
     * USE_DOCKER
     * DATABASE
     */
    key: string;

    /**
     * Value supplied for the field.
     */
    value: string;
}