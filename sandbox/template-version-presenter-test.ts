import {
    VersionReport
} from "../lib/models";

import {
    TemplateVersionPresenter
} from "../lib/services";

function main(): void {

    const presenter =
        new TemplateVersionPresenter();

    /*
     * Compatible report with no issues.
     */
    const compatiblePreview =
        presenter.format(
            "0.14.0",
            {
                compatible:
                    true,

                issues: []
            }
        );

    console.log(
        compatiblePreview
    );

    if (
        !compatiblePreview.includes(
            "Engine Version : 0.14.0"
        )
    ) {

        throw new Error(
            "The engine version was not displayed."
        );

    }

    if (
        !compatiblePreview.includes(
            "Status         : Compatible"
        )
    ) {

        throw new Error(
            "The compatible status was not displayed."
        );

    }

    if (
        compatiblePreview.includes(
            "Errors"
        ) ||
        compatiblePreview.includes(
            "Warnings"
        )
    ) {

        throw new Error(
            "An issue section was displayed for an empty report."
        );

    }

    /*
     * Warning-only report.
     */
    const warningReport:
        VersionReport = {

        compatible:
            true,

        issues: [
            {
                type:
                    "deprecated",

                templateId:
                    "legacy-template",

                warning:
                    true,

                message:
                    'Template "legacy-template" is deprecated. Use "modern-template" instead.'
            }
        ]
    };

    const warningPreview =
        presenter.format(
            "0.14.0",
            warningReport
        );

    console.log("");
    console.log(
        warningPreview
    );

    if (
        !warningPreview.includes(
            "Warnings"
        )
    ) {

        throw new Error(
            "The warnings heading was not displayed."
        );

    }

    if (
        !warningPreview.includes(
            "modern-template"
        )
    ) {

        throw new Error(
            "The warning message was not displayed."
        );

    }

    if (
        warningPreview.includes(
            "Errors"
        )
    ) {

        throw new Error(
            "The warning-only report displayed an errors section."
        );

    }

    /*
     * Blocking error plus warning.
     */
    const blockingReport:
        VersionReport = {

        compatible:
            false,

        issues: [
            {
                type:
                    "engine-too-old",

                templateId:
                    "modern-template",

                warning:
                    false,

                message:
                    'Template "modern-template" requires Project Genesis 2.0.0 or newer.'
            },
            {
                type:
                    "deprecated",

                templateId:
                    "legacy-feature",

                warning:
                    true,

                message:
                    'Template "legacy-feature" is deprecated.'
            }
        ]
    };

    const blockingPreview =
        presenter.format(
            "1.0.0",
            blockingReport
        );

    console.log("");
    console.log(
        blockingPreview
    );

    const expectedValues = [
        "Status         : Incompatible",
        "Errors",
        "requires Project Genesis 2.0.0",
        "Warnings",
        "legacy-feature"
    ];

    for (
        const expectedValue
        of expectedValues
    ) {

        if (
            !blockingPreview.includes(
                expectedValue
            )
        ) {

            throw new Error(
                `The version preview was missing: ${expectedValue}`
            );

        }

    }

    console.log(
        "Template version presenter test completed successfully."
    );

}

main();