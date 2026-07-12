import {
    TemplateManifest
} from "../lib/models";

function main(): void {

    const catalogManifest:
        TemplateManifest = {
        id: "nextjs-api",
        extends: "base-web",
        name: "Next.js API",
        version: "1.0.0",
        description:
            "Builds a Next.js API project.",
        author:
            "Project Genesis",
        category:
            "Web",
        tags: [
            "nextjs",
            "typescript",
            "api"
        ]
    };

    const legacyManifest:
        TemplateManifest = {
        id: "legacy-template",
        name: "Legacy Template",
        version: "1.0.0",
        description: "",
        author: "Test"
    };

    if (
        catalogManifest.category !==
        "Web"
    ) {

        throw new Error(
            "Catalog category was not preserved."
        );

    }

    if (
        catalogManifest.tags?.length !==
        3
    ) {

        throw new Error(
            "Catalog tags were not preserved."
        );

    }

    if (
        legacyManifest.category !==
        undefined
    ) {

        throw new Error(
            "Legacy manifest unexpectedly received a category."
        );

    }

    if (
        legacyManifest.tags !==
        undefined
    ) {

        throw new Error(
            "Legacy manifest unexpectedly received tags."
        );

    }

    console.log(
        "Template manifest catalog test completed successfully."
    );

}

main();