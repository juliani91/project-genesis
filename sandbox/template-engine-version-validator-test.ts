import {
    TemplateCompositionPlan,
    TemplatePackage
} from "../lib/models";

import {
    SemanticVersionService,
    TemplateEngineVersionValidator
} from "../lib/services";

function createTemplate(
    id: string,
    minGenesisVersion?: string,
    maxGenesisVersion?: string
): TemplatePackage {

    return {
        manifest: {
            id,
            name:
                id,

            version:
                "1.0.0",

            description:
                "",

            author:
                "Test",

            role:
                "base",

            minGenesisVersion,

            maxGenesisVersion
        },

        path:
            `C:/templates/${id}`,

        descriptors: {}
    };

}

function createPlan(
    templates:
        readonly TemplatePackage[]
): TemplateCompositionPlan {

    const base =
        templates[0];

    if (!base) {

        throw new Error(
            "A base template is required for the test plan."
        );

    }

    return {
        baseTemplate:
            base,

        featureTemplates:
            templates.slice(
                1
            ),

        orderedTemplates:
            templates
    };

}

function main(): void {

    const versionService =
        new SemanticVersionService();

    if (
        versionService.compare(
            "1.2.0",
            "1.1.9"
        ) <= 0
    ) {

        throw new Error(
            "Semantic version comparison failed."
        );

    }

    if (
        versionService.compare(
            "1.0.0",
            "1.0.0"
        ) !== 0
    ) {

        throw new Error(
            "Equal semantic versions were not treated as equal."
        );

    }

    let invalidVersionThrown =
        false;

    try {

        versionService.parse(
            "1.0"
        );

    } catch {

        invalidVersionThrown =
            true;

    }

    if (!invalidVersionThrown) {

        throw new Error(
            "An invalid semantic version was accepted."
        );

    }

    const validator =
        new TemplateEngineVersionValidator();

    /*
     * Compatible engine version.
     */
    const compatibleReport =
        validator.validate(
            createPlan([
                createTemplate(
                    "compatible-template",
                    "0.14.0",
                    "2.0.0"
                )
            ]),
            "1.0.0"
        );

    if (
        !compatibleReport.compatible
    ) {

        throw new Error(
            "A compatible engine version was rejected."
        );

    }

    /*
     * Minimum and maximum bounds are inclusive.
     */
    const minimumBoundary =
        validator.validate(
            createPlan([
                createTemplate(
                    "minimum-boundary",
                    "0.14.0"
                )
            ]),
            "0.14.0"
        );

    if (
        !minimumBoundary.compatible
    ) {

        throw new Error(
            "The minimum version boundary was rejected."
        );

    }

    const maximumBoundary =
        validator.validate(
            createPlan([
                createTemplate(
                    "maximum-boundary",
                    undefined,
                    "2.0.0"
                )
            ]),
            "2.0.0"
        );

    if (
        !maximumBoundary.compatible
    ) {

        throw new Error(
            "The maximum version boundary was rejected."
        );

    }

    /*
     * Engine too old.
     */
    const tooOldReport =
        validator.validate(
            createPlan([
                createTemplate(
                    "modern-template",
                    "2.0.0"
                )
            ]),
            "1.9.9"
        );

    if (
        tooOldReport.compatible
    ) {

        throw new Error(
            "An engine version below the minimum was accepted."
        );

    }

    if (
        tooOldReport.issues[0]?.type !==
        "engine-too-old"
    ) {

        throw new Error(
            "The engine-too-old issue was not reported."
        );

    }

    /*
     * Engine too new.
     */
    const tooNewReport =
        validator.validate(
            createPlan([
                createTemplate(
                    "legacy-template",
                    undefined,
                    "1.5.0"
                )
            ]),
            "2.0.0"
        );

    if (
        tooNewReport.compatible
    ) {

        throw new Error(
            "An engine version above the maximum was accepted."
        );

    }

    if (
        tooNewReport.issues[0]?.type !==
        "engine-too-new"
    ) {

        throw new Error(
            "The engine-too-new issue was not reported."
        );

    }

    /*
     * Multiple templates are all checked.
     */
    const multipleReport =
        validator.validate(
            createPlan([
                createTemplate(
                    "old-template",
                    undefined,
                    "0.5.0"
                ),
                createTemplate(
                    "new-feature",
                    "2.0.0"
                )
            ]),
            "1.0.0"
        );

    if (
        multipleReport.issues.length !==
        2
    ) {

        throw new Error(
            `Expected 2 engine version issues but received ${multipleReport.issues.length}.`
        );

    }

    console.log(
        "Template engine version validator test completed successfully."
    );

}

main();