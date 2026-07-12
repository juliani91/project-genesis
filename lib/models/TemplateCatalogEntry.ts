import { TemplatePackage } from "./TemplatePackage";

export interface TemplateCatalogEntry {

    /**
     * Unique template identifier.
     */
    id: string;

    /**
     * Human-readable template name.
     */
    name: string;

    /**
     * Template description shown in the catalog.
     */
    description: string;

    /**
     * Template version.
     */
    version: string;

    /**
     * Template author.
     */
    author: string;

    /**
     * Catalog category.
     *
     * Templates without a category use:
     *
     * "Uncategorized"
     */
    category: string;

    /**
     * Searchable catalog tags.
     *
     * Templates without tags use an empty array.
     */
    tags: readonly string[];

    /**
     * Whether this template extends another template.
     */
    parentId?: string;

    /**
     * Original discovered template package.
     *
     * This allows a selected catalog entry to be passed
     * into the existing generation pipeline.
     */
    template: TemplatePackage;

}