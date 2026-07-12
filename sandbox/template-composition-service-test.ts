import {
    FileDescriptor,
    FolderDescriptor,
    TemplateCompositionPlan,
    TemplatePackage,
    Wizard
} from "../lib/models";

import {
    TemplateCompositionService
} from "../lib/services";

function createTemplate(
    id: string,
    role:
        "base" |
        "feature",
    files:
        FileDescriptor[],
    folders:
        FolderDescriptor[],
    wizard?: Wizard
): TemplatePackage {

    return {
        manifest: {
            id,
            name: id,
            version: "1.0.0",
            description: "",
            author: "Test",
            role
        },

        path:
            `C:/templates/${id}`,

        descriptors: {
            files,
            folders,
            wizard,

            resolvedFiles:
                files.map(
                    (descriptor) => ({
                        descriptor,
                        templatePath:
                            `C:/templates/${id}`
                    })
                )
        }
    };

}

async function main(): Promise<void> {

    const base =
        createTemplate(
            "nextjs",
            "base",
            [
                {
                    source:
                        "README.md",

                    destination:
                        "README.md",

                    mode:
                        "render"
                }
            ],
            [
                {
                    path: "src"
                }
            ],
            {
                title:
                    "Next.js Wizard",

                description:
                    "Base wizard.",

                steps: [
                    {
                        id: "project",

                        title:
                            "Project",

                        description:
                            "",

                        fields: [
                            {
                                key:
                                    "PROJECT_NAME",

                                label:
                                    "Project Name",

                                type:
                                    "string",

                                required:
                                    true
                            }
                        ]
                    }
                ]
            }
        );

    const docker =
        createTemplate(
            "docker",
            "feature",
            [
                {
                    source:
                        "Dockerfile",

                    destination:
                        "Dockerfile",

                    mode:
                        "render"
                }
            ],
            [
                {
                    path: "docker"
                }
            ],
            {
                title:
                    "Docker Wizard",

                description:
                    "Docker configuration.",

                steps: [
                    {
                        id: "docker",

                        title:
                            "Docker",

                        description:
                            "",

                        fields: [
                            {
                                key:
                                    "DOCKER_PORT",

                                label:
                                    "Docker Port",

                                type:
                                    "string",

                                required:
                                    true
                            }
                        ]
                    }
                ]
            }
        );

    const playwright =
        createTemplate(
            "playwright",
            "feature",
            [
                {
                    source:
                        "playwright.config.ts",

                    destination:
                        "playwright.config.ts",

                    mode:
                        "render"
                }
            ],
            [
                {
                    path: "tests"
                },
                {
                    path: "src"
                }
            ],
            {
                title:
                    "Playwright Wizard",

                description:
                    "Testing configuration.",

                steps: [
                    {
                        id: "testing",

                        title:
                            "Testing",

                        description:
                            "",

                        fields: [
                            {
                                key:
                                    "TEST_BROWSER",

                                label:
                                    "Test Browser",

                                type:
                                    "string",

                                required:
                                    true
                            }
                        ]
                    }
                ]
            }
        );

    const plan:
        TemplateCompositionPlan = {
        baseTemplate:
            base,

        featureTemplates: [
            docker,
            playwright
        ],

        orderedTemplates: [
            base,
            docker,
            playwright
        ]
    };

    const service =
        new TemplateCompositionService();

    /*
     * Because this focused test already contains resolved
     * descriptors, make the templates available to the
     * inheritance resolver as their own catalog.
     */
    const composed =
        await service.compose(
            plan,
            [
                base,
                docker,
                playwright
            ]
        );

    const files =
        composed
            .descriptors
            .resolvedFiles;

    if (
        !files ||
        files.length !== 3
    ) {

        throw new Error(
            "The composed file collection was incorrect."
        );

    }

    const fileDestinations =
        files.map(
            (file) =>
                file.descriptor
                    .destination
        );

    if (
        !fileDestinations.includes(
            "README.md"
        ) ||
        !fileDestinations.includes(
            "Dockerfile"
        ) ||
        !fileDestinations.includes(
            "playwright.config.ts"
        )
    ) {

        throw new Error(
            "The composed files were not preserved."
        );

    }

    const folders =
        composed
            .descriptors
            .folders ??
        [];

    const folderPaths =
        folders.map(
            (folder) =>
                folder.path
        );

    if (
        folderPaths.length !== 3
    ) {

        throw new Error(
            `Expected 3 unique folders but received ${folderPaths.length}.`
        );

    }

    if (
        !folderPaths.includes("src") ||
        !folderPaths.includes("docker") ||
        !folderPaths.includes("tests")
    ) {

        throw new Error(
            "The composed folders were incorrect."
        );

    }

    const wizard =
        composed
            .descriptors
            .wizard;

    if (!wizard) {

        throw new Error(
            "The composed wizard was missing."
        );

    }

    const stepIds =
        wizard.steps.map(
            (step) =>
                step.id
        );

    if (
        stepIds.join(",") !==
        "project,docker,testing"
    ) {

        throw new Error(
            `The composed wizard steps were incorrect: ${stepIds.join(",")}`
        );

    }

    /*
     * File conflict.
     */
    const conflictingFeature =
        createTemplate(
            "conflicting-feature",
            "feature",
            [
                {
                    source:
                        "custom-readme.md",

                    destination:
                        "README.md",

                    mode:
                        "render"
                }
            ],
            [],
            undefined
        );

    let conflictThrown =
        false;

    try {

        await service.compose(
            {
                baseTemplate:
                    base,

                featureTemplates: [
                    conflictingFeature
                ],

                orderedTemplates: [
                    base,
                    conflictingFeature
                ]
            },
            [
                base,
                conflictingFeature
            ]
        );

    } catch (error) {

        conflictThrown =
            true;

        const message =
            error instanceof Error
                ? error.message
                : String(error);

        if (
            !message.includes(
                "Template composition file conflict"
            )
        ) {

            throw new Error(
                `Unexpected composition-conflict error: ${message}`
            );

        }

    }

    if (!conflictThrown) {

        throw new Error(
            "A composition file conflict was not rejected."
        );

    }

    console.log(
        "Template composition service test completed successfully."
    );

}

main().catch(
    (error: unknown) => {

        console.error(
            "Template composition service test failed.",
            error
        );

        process.exitCode = 1;

    }
);