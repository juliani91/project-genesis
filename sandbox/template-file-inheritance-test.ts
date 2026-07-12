import {
    FileDescriptor,
    TemplatePackage
} from "../lib/models";

import {
    TemplateFileInheritanceService
} from "../lib/services";

function createTemplate(
    id: string,
    templatePath: string,
    files: FileDescriptor[],
    parent?: string
): TemplatePackage {

    return {
        manifest: {
            id,
            extends: parent,
            name: id,
            version: "1.0.0",
            description: "",
            author: "Test"
        },

        path: templatePath,

        descriptors: {
            files
        }
    };

}

function main(): void {

    const parent =
        createTemplate(
            "base-web",
            "C:/templates/base-web",
            [
                {
                    source: "README.md",
                    destination: "README.md",
                    mode: "render"
                },
                {
                    source: "LICENSE",
                    destination: "LICENSE",
                    mode: "copy"
                }
            ]
        );

    const child =
        createTemplate(
            "nextjs-app",
            "C:/templates/nextjs-app",
            [
                {
                    source: "custom-README.md",
                    destination: "README.md",
                    mode: "render"
                },
                {
                    source: "src/index.ts",
                    destination: "src/index.ts",
                    mode: "render"
                }
            ],
            "base-web"
        );

    const service =
        new TemplateFileInheritanceService();

    const resolved =
        service.resolve(
            parent,
            child
        );

    console.log(
        "Resolved files:"
    );

    console.log(
        JSON.stringify(
            resolved,
            null,
            2
        )
    );

    if (resolved.length !== 3) {

        throw new Error(
            `Expected 3 resolved files but received ${resolved.length}.`
        );

    }

    const readme =
        resolved.find(
            (file) =>
                file.descriptor.destination ===
                "README.md"
        );

    if (!readme) {

        throw new Error(
            "README.md was not resolved."
        );

    }

    if (
        readme.descriptor.source !==
        "custom-README.md"
    ) {

        throw new Error(
            "The child README did not override the parent README."
        );

    }

    if (
        readme.templatePath !==
        "C:/templates/nextjs-app"
    ) {

        throw new Error(
            "The child README source ownership was incorrect."
        );

    }

    const license =
        resolved.find(
            (file) =>
                file.descriptor.destination ===
                "LICENSE"
        );

    if (!license) {

        throw new Error(
            "The parent LICENSE was not inherited."
        );

    }

    if (
        license.descriptor.source !==
        "LICENSE"
    ) {

        throw new Error(
            "The inherited LICENSE descriptor was incorrect."
        );

    }

    if (
        license.templatePath !==
        "C:/templates/base-web"
    ) {

        throw new Error(
            "The inherited LICENSE source ownership was incorrect."
        );

    }

    const childOnlyFile =
        resolved.find(
            (file) =>
                file.descriptor.destination ===
                "src/index.ts"
        );

    if (!childOnlyFile) {

        throw new Error(
            "The child-only file was not included."
        );

    }

    if (
        childOnlyFile.templatePath !==
        "C:/templates/nextjs-app"
    ) {

        throw new Error(
            "The child-only file ownership was incorrect."
        );

    }

    console.log(
        "Template file inheritance test completed successfully."
    );

}

main();