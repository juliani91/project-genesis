export interface WizardOption {
    /**
     * Text displayed to the user.
     *
     * Example:
     * PostgreSQL
     * SQL Server
     */
    label: string;

    /**
     * Value stored in the WizardAnswer.
     *
     * Example:
     * postgres
     * sqlserver
     */
    value: string;
}