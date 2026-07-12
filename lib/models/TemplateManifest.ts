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
    extends?: string;

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

}