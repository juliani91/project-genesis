import {
    TemplatePackage,
    TemplateProfile
} from "../lib/models";

import {
    TemplateProfileResolver
} from "../lib/services";

function createTemplate(
    id: string,
    role:
        "base" |
        "feature"
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

        descriptors: {}

    };

}

function main(): void {

    const nextjs =
        createTemplate(
            "nextjs",
            "base"
        );

    const docker =
        createTemplate(
            "docker",
            "feature"
        );

    const playwright =
        createTemplate(
            "playwright",
            "feature"
        );

    const templates = [
        nextjs,
        docker,
        playwright
    ];

    const profile:
        TemplateProfile = {

        id:
            "nextjs-saas",

        name:
            "Next.js SaaS",

        description:
            "",

        category:
            "Web",

        baseTemplate:
            "nextjs",

        featureTemplates: [
            "docker",
            "playwright"
        ]

    };

    const resolver =
        new TemplateProfileResolver();

    const resolved =
        resolver.resolve(
            profile,
            templates
        );

    if (
        resolved.profileId !==
        profile.id
    ) {

        throw new Error(
            "Resolved profile ID was incorrect."
        );

    }

    if (
        resolved.baseTemplate
            .manifest.id !==
        "nextjs"
    ) {

        throw new Error(
            "Resolved base template was incorrect."
        );

    }

    if (
        resolved.featureTemplates.length !==
        2
    ) {

        throw new Error(
            "Resolved feature template count was incorrect."
        );

    }

    if (
        resolved.featureTemplates[0]
            .manifest.id !==
        "docker"
    ) {

        throw new Error(
            "Feature template ordering was incorrect."
        );

    }

    /*
     * Unknown base template.
     */
    try {

        resolver.resolve(
            {
                ...profile,
                baseTemplate:
                    "missing-base"
            },
            templates
        );

        throw new Error(
            "Missing base template was accepted."
        );

    } catch {

        // Expected.

    }

    /*
     * Unknown feature template.
     */
    try {

        resolver.resolve(
            {
                ...profile,
                featureTemplates: [
                    "docker",
                    "missing-feature"
                ]
            },
            templates
        );

        throw new Error(
            "Missing feature template was accepted."
        );

    } catch {

        // Expected.

    }

    console.log(
        "Template profile resolver test completed successfully."
    );

}

main();