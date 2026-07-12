import {
    TemplateCatalogEntry
} from "../models";

export class TemplateCatalogPresenter {

    public formatPreview(
        entry: TemplateCatalogEntry
    ): string {

        const tags =
            entry.tags.length > 0
                ? entry.tags.join(", ")
                : "None";

        const parent =
            entry.parentId ??
            "None";

        return [
            "Template Preview",
            "----------------",
            `Name        : ${entry.name}`,
            `Description : ${entry.description || "No description provided."}`,
            `Category    : ${entry.category}`,
            `Version     : ${entry.version}`,
            `Author      : ${entry.author}`,
            `Tags        : ${tags}`,
            `Parent      : ${parent}`
        ].join("\n");

    }

}