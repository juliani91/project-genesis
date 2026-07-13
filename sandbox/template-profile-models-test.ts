import {
    ResolvedTemplateProfile,
    TemplatePackage,
    TemplateProfile
} from "../lib/models";

function createTemplate(
    id: string
): TemplatePackage {

    return {
        manifest: {
            id,
            name: id,
            version: "1.0.0",
            description: "",
            author: "Test"
        },

        path:
            `C:/templates/${id}`,

        descriptors: {}
    };

}

function main(): void {

    const profile:
        TemplateProfile = {

        id:
            "nextjs-saas",

        name:
            "Next.js SaaS",

        description:
            "Complete SaaS stack.",

        category:
            "Web",

        baseTemplate:
            "nextjs",

        featureTemplates: [
            "postgresql",
            "docker",
            "playwright"
        ]

    };

    if (
        profile.featureTemplates.length !==
        3
    ) {

        throw new Error(
            "Profile feature template count was incorrect."
        );

    }

    const resolved:
        ResolvedTemplateProfile = {

        profileId:
            profile.id,

        baseTemplate:
            createTemplate(
                "nextjs"
            ),

        featureTemplates: [
            createTemplate(
                "postgresql"
            ),
            createTemplate(
                "docker"
            ),
            createTemplate(
                "playwright"
            )
        ]

    };

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
        3
    ) {

        throw new Error(
            "Resolved feature template count was incorrect."
        );

    }

    if (
        resolved.featureTemplates[2]
            .manifest.id !==
        "playwright"
    ) {

        throw new Error(
            "Resolved feature template ordering was incorrect."
        );

    }

    console.log(
        "Template profile models test completed successfully."
    );

}

main();