import {
    ResolvedTemplateProfile,
    TemplatePackage,
    TemplateProfile
} from "../lib/models";

import {
    TemplateProfileValidator
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

    const validator =
        new TemplateProfileValidator();

    const validProfile:
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

    const validDefinitionResult =
        validator.validateDefinition(
            validProfile
        );

    if (
        !validDefinitionResult.valid
    ) {

        throw new Error(
            [
                "A valid profile definition was rejected:",
                ...validDefinitionResult.errors
            ].join(" ")
        );

    }

    /*
     * Invalid definition with multiple issues.
     */
    const invalidProfile:
        TemplateProfile = {

        id:
            "   ",

        name:
            "",

        description:
            "",

        category:
            " ",

        baseTemplate:
            "nextjs",

        featureTemplates: [
            "nextjs",
            "docker",
            " DOCKER ",
            ""
        ]
    };

    const invalidDefinitionResult =
        validator.validateDefinition(
            invalidProfile
        );

    if (
        invalidDefinitionResult.valid
    ) {

        throw new Error(
            "An invalid profile definition was accepted."
        );

    }

    const expectedDefinitionErrors = [
        "Profile ID is required.",
        "Profile name is required.",
        "Profile category is required."
    ];

    for (
        const expectedError
        of expectedDefinitionErrors
    ) {

        if (
            !invalidDefinitionResult
                .errors
                .includes(
                    expectedError
                )
        ) {

            throw new Error(
                `Missing validation error: ${expectedError}`
            );

        }

    }

    if (
        !invalidDefinitionResult
            .errors
            .some(
                (error) =>
                    error.includes(
                        "base template cannot also be"
                    )
            )
    ) {

        throw new Error(
            "The base-as-feature error was not reported."
        );

    }

    if (
        !invalidDefinitionResult
            .errors
            .some(
                (error) =>
                    error.includes(
                        "Duplicate feature template ID"
                    )
            )
    ) {

        throw new Error(
            "The duplicate feature error was not reported."
        );

    }

    if (
        !invalidDefinitionResult
            .errors
            .some(
                (error) =>
                    error.includes(
                        "cannot be blank"
                    )
            )
    ) {

        throw new Error(
            "The blank feature ID error was not reported."
        );

    }

    /*
     * Valid resolved profile.
     */
    const validResolved:
        ResolvedTemplateProfile = {

        profileId:
            validProfile.id,

        baseTemplate:
            createTemplate(
                "nextjs",
                "base"
            ),

        featureTemplates: [
            createTemplate(
                "docker",
                "feature"
            ),
            createTemplate(
                "playwright",
                "feature"
            )
        ]
    };

    const validResolvedResult =
        validator.validateResolved(
            validResolved
        );

    if (
        !validResolvedResult.valid
    ) {

        throw new Error(
            "A valid resolved profile was rejected."
        );

    }

    /*
     * Invalid resolved roles.
     */
    const invalidResolved:
        ResolvedTemplateProfile = {

        profileId:
            "invalid-resolved",

        baseTemplate:
            createTemplate(
                "docker",
                "feature"
            ),

        featureTemplates: [
            createTemplate(
                "another-base",
                "base"
            )
        ]
    };

    const invalidResolvedResult =
        validator.validateResolved(
            invalidResolved
        );

    if (
        invalidResolvedResult.valid
    ) {

        throw new Error(
            "An invalid resolved profile was accepted."
        );

    }

    if (
        invalidResolvedResult.errors.length !==
        2
    ) {

        throw new Error(
            `Expected 2 resolved-role errors but received ${invalidResolvedResult.errors.length}.`
        );

    }

    console.log(
        "Template profile validator test completed successfully."
    );

}

main();