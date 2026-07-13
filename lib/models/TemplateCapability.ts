/**
 * A capability provided by a template.
 *
 * Examples:
 *
 * node
 * typescript
 * react
 * docker
 */
export interface TemplateCapability {

    /**
     * Unique capability identifier.
     */
    id: string;

    /**
     * Human-readable capability name.
     */
    name: string;

    /**
     * Optional description.
     */
    description?: string;

}