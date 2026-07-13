import {
    TemplateProfile
} from "../lib/models";

import {
    TemplateProfileSelectionService
} from "../lib/services";

function createProfile(
    id: string,
    name: string,
    category: string
): TemplateProfile {

    return {
        id,
        name,
        description:
            `${name} profile.`,
        category,
        baseTemplate:
            "base-template",
        featureTemplates: []
    };

}

function main(): void {

    const profiles:
        TemplateProfile[] = [
        createProfile(
            "python-api",
            "Python API",
            "Python"
        ),

        createProfile(
            "nextjs-saas",
            "Next.js SaaS",
            "Web"
        ),

        createProfile(
            "fastapi-api",
            "FastAPI API",
            "Python"
        ),

        createProfile(
            "react-app",
            "React Application",
            "Web"
        )
    ];

    const service =
        new TemplateProfileSelectionService();

    const sorted =
        service.sort(
            profiles
        );

    const sortedIds =
        sorted.map(
            (profile) =>
                profile.id
        );

    const expectedIds = [
        "fastapi-api",
        "python-api",
        "nextjs-saas",
        "react-app"
    ];

    if (
        JSON.stringify(
            sortedIds
        ) !==
        JSON.stringify(
            expectedIds
        )
    ) {

        throw new Error(
            [
                "Profile sorting was incorrect.",
                `Expected: ${expectedIds.join(", ")}`,
                `Actual: ${sortedIds.join(", ")}`
            ].join(" ")
        );

    }

    const selected =
        service.findById(
            profiles,
            " NEXTJS-SAAS "
        );

    if (
        selected.id !==
        "nextjs-saas"
    ) {

        throw new Error(
            "Case-insensitive profile lookup failed."
        );

    }

    let missingThrown =
        false;

    try {

        service.findById(
            profiles,
            "missing-profile"
        );

    } catch (error) {

        missingThrown =
            true;

        const message =
            error instanceof Error
                ? error.message
                : String(error);

        if (
            !message.includes(
                "Unknown template profile"
            )
        ) {

            throw new Error(
                `Unexpected missing-profile error: ${message}`
            );

        }

    }

    if (!missingThrown) {

        throw new Error(
            "An unknown profile was not rejected."
        );

    }

    if (
        profiles[0].id !==
        "python-api"
    ) {

        throw new Error(
            "Profile sorting modified the original collection."
        );

    }

    console.log(
        "Template profile selection test completed successfully."
    );

}

main();