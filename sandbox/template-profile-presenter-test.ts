import {
    TemplateProfile
} from "../lib/models";

import {
    TemplateProfilePresenter
} from "../lib/services";

function main(): void {

    const presenter =
        new TemplateProfilePresenter();

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

    const preview =
        presenter.format(
            profile
        );

    console.log(preview);

    const expectedValues = [
        "Profile Preview",
        "Next.js SaaS",
        "Complete SaaS stack.",
        "Web",
        "nextjs",
        "postgresql, docker, playwright"
    ];

    for (
        const expectedValue
        of expectedValues
    ) {

        if (
            !preview.includes(
                expectedValue
            )
        ) {

            throw new Error(
                `Profile preview was missing: ${expectedValue}`
            );

        }

    }

    const baseOnlyProfile:
        TemplateProfile = {
        id:
            "base-only",

        name:
            "Base Only",

        description:
            "",

        category:
            "Test",

        baseTemplate:
            "base-template",

        featureTemplates: []
    };

    const baseOnlyPreview =
        presenter.format(
            baseOnlyProfile
        );

    if (
        !baseOnlyPreview.includes(
            "No description provided."
        )
    ) {

        throw new Error(
            "The empty profile description fallback was not displayed."
        );

    }

    if (
        !baseOnlyPreview.includes(
            "Features    : None"
        )
    ) {

        throw new Error(
            "The base-only feature fallback was not displayed."
        );

    }

    console.log(
        "Template profile presenter test completed successfully."
    );

}

main();