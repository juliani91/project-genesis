import {
    TemplatePackage,
    TemplateProfile
} from "../lib/models";

import {
    TemplateProfileCompositionService
} from "../lib/services";

function createTemplate(
    id: string,
    role:
        "base" |
        "feature",
    provides:
        string[] = [],
    requiresCapabilities:
        string[] = []
): TemplatePackage {

    return {
        manifest: {
            id,
            name: id,
            version: "1.0.0",
            description: "",
            author: "Test",
            role,
            provides,
            requiresCapabilities
        },

        path:
            `C:/templates/${id}`,

        descriptors: {}
    };

}

function main(): void {

    const nextjs =
        createTemplate(
            "nextjs",
            "base",
            [
                "node",
                "typescript",
                "react"
            ]
        );

    const playwright =
        createTemplate(
            "playwright",
            "feature",
            [
                "playwright",
                "testing"
            ],
            [
                "node",
                "typescript"
            ]
        );

    const docker =
        createTemplate(
            "docker",
            "feature",
            [
                "docker"
            ]
        );

    const profile:
        TemplateProfile = {
        id:
            "nextjs-testing",

        name:
            "Next.js Testing",

        description:
            "Next.js with Docker and Playwright.",

        category:
            "Web",

        baseTemplate:
            "nextjs",

        featureTemplates: [
            "docker",
            "playwright"
        ]
    };

    const service =
        new TemplateProfileCompositionService();

    const result =
        service.build(
            profile,
            [
                nextjs,
                playwright,
                docker
            ]
        );

    if (
        result.resolvedProfile
            .profileId !==
        "nextjs-testing"
    ) {

        throw new Error(
            "The resolved profile ID was incorrect."
        );

    }

    const planIds =
        result.plan
            .orderedTemplates
            .map(
                (template) =>
                    template.manifest.id
            );

    if (
        planIds.join(",") !==
        "nextjs,docker,playwright"
    ) {

        throw new Error(
            `The profile composition order was incorrect: ${planIds.join(",")}`
        );

    }

    if (
        !result.compatibility
            .compatible
    ) {

        throw new Error(
            [
                "A compatible profile was rejected:",
                ...result.compatibility
                    .issues
                    .map(
                        (issue) =>
                            issue.message
                    )
            ].join(" ")
        );

    }

    /*
     * Incompatible profile still returns a report.
     */
    const python =
        createTemplate(
            "python",
            "base",
            [
                "python"
            ]
        );

    const incompatibleProfile:
        TemplateProfile = {
        ...profile,

        id:
            "python-playwright",

        baseTemplate:
            "python",

        featureTemplates: [
            "playwright"
        ]
    };

    const incompatibleResult =
        service.build(
            incompatibleProfile,
            [
                python,
                playwright
            ]
        );

    if (
        incompatibleResult
            .compatibility
            .compatible
    ) {

        throw new Error(
            "An incompatible profile was accepted."
        );

    }

    if (
        incompatibleResult
            .compatibility
            .issues
            .length !==
        2
    ) {

        throw new Error(
            "The incompatible profile did not report both missing capabilities."
        );

    }

    /*
     * Invalid definition throws.
     */
    let invalidDefinitionThrown =
        false;

    try {

        service.build(
            {
                ...profile,
                id: ""
            },
            [
                nextjs,
                playwright,
                docker
            ]
        );

    } catch (error) {

        invalidDefinitionThrown =
            true;

        const message =
            error instanceof Error
                ? error.message
                : String(error);

        if (
            !message.includes(
                "Profile ID is required"
            )
        ) {

            throw new Error(
                `Unexpected invalid-profile error: ${message}`
            );

        }

    }

    if (!invalidDefinitionThrown) {

        throw new Error(
            "An invalid profile definition was not rejected."
        );

    }

    console.log(
        "Template profile composition test completed successfully."
    );

}

main();