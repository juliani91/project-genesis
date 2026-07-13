/**
 * Represents a predefined collection of templates.
 */
export interface TemplateProfile {

    /**
     * Unique profile identifier.
     */
    id: string;

    /**
     * Display name.
     */
    name: string;

    /**
     * Description shown to users.
     */
    description: string;

    /**
     * Profile category.
     */
    category: string;

    /**
     * Base template ID.
     */
    baseTemplate: string;

    /**
     * Feature template IDs.
     */
    featureTemplates: string[];

}