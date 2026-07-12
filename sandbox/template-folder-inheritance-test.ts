import {
    ConditionRule,
    FolderDescriptor,
    TemplatePackage
} from "../lib/models";

import {
    TemplateFolderInheritanceService
} from "../lib/services";

function createTemplate(
    id: string,
    templatePath: string,
    folders: FolderDescriptor[],
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
            folders
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
                    path: "docs"
                },
                {
                    path: "Database",

                    rules: [
                        {
                            type: "condition",
                            variable:
                                "USE_DATABASE",
                            equals:
                                "true"
                        } as ConditionRule
                    ]
                }
            ]
        );

    const child =
        createTemplate(
            "nextjs-app",
            "C:/templates/nextjs-app",
            [
                {
                    path: "Database",

                    rules: [
                        {
                            type: "condition",
                            variable:
                                "DATABASE",
                            equals:
                                "postgres"
                        } as ConditionRule
                    ]
                },
                {
                    path: "src"
                }
            ],
            "base-web"
        );

    const service =
        new TemplateFolderInheritanceService();

    const resolved =
        service.resolve(
            parent,
            child
        );

    console.log(
        "Resolved folders:"
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
            `Expected 3 resolved folders but received ${resolved.length}.`
        );

    }

    const docs =
        resolved.find(
            (folder) =>
                folder.path ===
                "docs"
        );

    if (!docs) {

        throw new Error(
            "The parent docs folder was not inherited."
        );

    }

    const database =
        resolved.find(
            (folder) =>
                folder.path ===
                "Database"
        );

    if (!database) {

        throw new Error(
            "The Database folder was not resolved."
        );

    }

    if (
        database.rules?.length !== 1
    ) {

        throw new Error(
            "The child Database rules were not preserved."
        );

    }

    const databaseRule =
        database.rules[0];

    if (
        databaseRule.type !==
        "condition"
    ) {

        throw new Error(
            "The resolved Database rule type was incorrect."
        );

    }

    const conditionRule =
        databaseRule as ConditionRule;

    if (
        conditionRule.variable !==
        "DATABASE"
    ) {

        throw new Error(
            "The child Database rule did not override the parent rule."
        );

    }

    if (
        conditionRule.equals !==
        "postgres"
    ) {

        throw new Error(
            "The child Database rule expected value was not preserved."
        );

    }

    const src =
        resolved.find(
            (folder) =>
                folder.path ===
                "src"
        );

    if (!src) {

        throw new Error(
            "The child-only src folder was not included."
        );

    }

    console.log(
        "Template folder inheritance test completed successfully."
    );

}

main();