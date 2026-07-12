import { TemplateRole } from "./TemplateRole";

export interface TemplateManifest {

    /**
     * Unique template identifier.
     */
    id: string;

    /**
     * Optional parent template identifier.
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
     */
    category?: string;

    /**
     * Optional searchable catalog tags.
     */
    tags?: string[];

    /**
     * Composition role.
     *
     * Missing values default to "base".
     */
    role?: TemplateRole;

    /**
     * Template IDs required by this template during composition.
     *
     * Version 1 supports feature-template dependencies.
     */
    requires?: string[];

}