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

    /**
     * Capability IDs provided by this template.
     *
     * Examples:
     * node
     * typescript
     * react
     */
    provides?: string[];

    /**
     * Capability IDs required for this template to work.
     *
     * This is separate from `requires`, which contains
     * required template IDs.
     */
    requiresCapabilities?: string[];

    /**
     * Capability IDs that cannot coexist with this template.
     */
    conflictsWith?: string[];

    /**
     * Minimum supported Project Genesis engine version.
     *
     * Example:
     * "1.4.0"
     */
    minGenesisVersion?: string;

    /**
     * Maximum supported Project Genesis engine version.
     *
     * Example:
     * "2.0.0"
     */
    maxGenesisVersion?: string;

    /**
     * Version constraints for other templates in the composition.
     *
     * Keys are template IDs.
     * Values are semantic-version constraints.
     *
     * Example:
     *
     * {
     *     "nextjs": ">=2.1.0",
     *     "docker": "^1.5.0"
     * }
     */
    requiresTemplateVersions?: Record<
        string,
        string
    >;

    /**
     * Whether this template is deprecated.
     */
    deprecated?: boolean;

    /**
     * Optional replacement template ID.
     *
     * This is normally used when deprecated is true.
     */
    replacementTemplate?: string;

}