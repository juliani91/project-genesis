export interface TemplateManifest {

    /**
     * Unique template identifier.
     *
     * Example:
     * "project-genesis"
     */
    id: string;

    /**
     * Optional parent template identifier.
     *
     * Example:
     * "base-web"
     */
    extends?: string | null;

    /**
     * Human-readable template name.
     */
    name: string;

    /**
     * Template version.
     */
    version: string;

    /**
     * Template description.
     */
    description: string;

    /**
     * Template author.
     */
    author: string;

    /**
     * Optional catalog category.
     *
     * Examples:
     * "Web"
     * "Python"
     * "Game Development"
     */
    category?: string;

    /**
     * Optional searchable catalog tags.
     *
     * Examples:
     * "typescript"
     * "nextjs"
     * "api"
     */
    tags?: string[];

}