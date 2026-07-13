import {
    TemplateCompositionPlan,
    TemplatePackage
} from "../lib/models";

import {
    SemanticVersionService,
    TemplateVersionValidator
} from "../lib/services";

function createTemplate(
    id: string,
    version: string,
    role:
        "base" |
        "feature",
    requiresTemplateVersions:
        Record<string, string> = {}
): TemplatePackage {

    return {
        manifest: {
            id,
            name: id,
            version,
            description: "",
            author: "Test",
            role,
            requiresTemplateVersions
        },

        path:
            `C:/templates/${id}`,

        descriptors: {}
    };

}

function createPlan(
    base:
        TemplatePackage,
    features:
        readonly TemplatePackage[]
): TemplateCompositionPlan {

    return {
        baseTemplate:
            base,

        featureTemplates:
            features,

        orderedTemplates: [
            base,
            ...features
        ]
    };

}

function main(): void {

    const semanticVersionService =
        new SemanticVersionService();

    const satisfactionCases = [
        {
            version:
                "1.2.3",

            constraint:
                "1.2.3",

            expected:
                true
        },
        {
            version:
                "1.3.0",

            constraint:
                ">=1.2.3",

            expected:
                true
        },
        {
            version:
                "1.2.2",

            constraint:
                ">=1.2.3",

            expected:
                false
        },
        {
            version:
                "1.9.0",

            constraint:
                "^1.5.0",

            expected:
                true
        },
        {
            version:
                "2.0.0",

            constraint:
                "^1.5.0",

            expected:
                false
        },
        {
            version:
                "1.5.9",

            constraint:
                "~1.5.0",

            expected:
                true
        },
        {
            version:
                "1.6.0",

            constraint:
                "~1.5.0",

            expected:
                false
        },
        {
            version:
                "0.2.9",

            constraint:
                "^0.2.3",

            expected:
                true
        },
        {
            version:
                "0.3.0",

            constraint:
                "^0.2.3",

            expected:
                false
        }
    ];

    for (
        const testCase
        of satisfactionCases
    ) {

        const actual =
            semanticVersionService
                .satisfies(
                    testCase.version,
                    testCase.constraint
                );

        if (
            actual !==
            testCase.expected
        ) {

            throw new Error(
                [
                    "Semantic-version satisfaction failed.",
                    `Version: ${testCase.version}`,
                    `Constraint: ${testCase.constraint}`,
                    `Expected: ${testCase.expected}`,
                    `Actual: ${actual}`
                ].join(" ")
            );

        }

    }

    const nextjs =
        createTemplate(
            "nextjs",
            "3.2.0",
            "base"
        );

    const docker =
        createTemplate(
            "docker",
            "1.6.0",
            "feature"
        );

    const playwright =
        createTemplate(
            "playwright",
            "1.0.0",
            "feature",
            {
                nextjs:
                    ">=3.0.0",

                docker:
                    "^1.5.0"
            }
        );

    const validator =
        new TemplateVersionValidator();

    const compatibleReport =
        validator.validate(
            createPlan(
                nextjs,
                [
                    docker,
                    playwright
                ]
            )
        );

    if (
        !compatibleReport.compatible
    ) {

        throw new Error(
            [
                "A compatible template version plan was rejected:",
                ...compatibleReport
                    .issues
                    .map(
                        (issue) =>
                            issue.message
                    )
            ].join(" ")
        );

    }

    /*
     * Selected template version does not satisfy
     * the declared constraint.
     */
    const oldNextjs =
        createTemplate(
            "nextjs",
            "2.9.0",
            "base"
        );

    const incompatibleReport =
        validator.validate(
            createPlan(
                oldNextjs,
                [
                    docker,
                    playwright
                ]
            )
        );

    if (
        incompatibleReport.compatible
    ) {

        throw new Error(
            "An incompatible template version was accepted."
        );

    }

    if (
        !incompatibleReport
            .issues
            .some(
                (issue) =>
                    issue.type ===
                        "template-version" &&
                    issue.message.includes(
                        "2.9.0"
                    )
            )
    ) {

        throw new Error(
            "The incompatible selected version was not reported."
        );

    }

    /*
     * Required template is absent.
     */
    const missingReport =
        validator.validate(
            createPlan(
                nextjs,
                [
                    playwright
                ]
            )
        );

    if (
        missingReport.compatible
    ) {

        throw new Error(
            "A missing version-constrained template was accepted."
        );

    }

    if (
        !missingReport
            .issues
            .some(
                (issue) =>
                    issue.message.includes(
                        "not present in the composition"
                    )
            )
    ) {

        throw new Error(
            "The missing required template was not reported."
        );

    }

    let invalidConstraintThrown =
        false;

    try {

        semanticVersionService.satisfies(
            "1.0.0",
            "latest"
        );

    } catch {

        invalidConstraintThrown =
            true;

    }

    if (!invalidConstraintThrown) {

        throw new Error(
            "An invalid semantic-version constraint was accepted."
        );

    }

    console.log(
        "Template version validator test completed successfully."
    );

}

main();