import {
    TemplateCompositionPlan,
    TemplatePackage
} from "../lib/models";

import {
    TemplateDeprecationValidator,
    TemplateVersionReportService
} from "../lib/services";

function createTemplate(
    id: string,
    role:
        "base" |
        "feature",
    options: {
        version?: string;
        deprecated?: boolean;
        replacementTemplate?: string;
        minGenesisVersion?: string;
        maxGenesisVersion?: string;
        requiresTemplateVersions?:
            Record<string, string>;
    } = {}
): TemplatePackage {

    return {
        manifest: {
            id,

            name:
                id,

            version:
                options.version ??
                "1.0.0",

            description:
                "",

            author:
                "Test",

            role,

            deprecated:
                options.deprecated,

            replacementTemplate:
                options.replacementTemplate,

            minGenesisVersion:
                options.minGenesisVersion,

            maxGenesisVersion:
                options.maxGenesisVersion,

            requiresTemplateVersions:
                options.requiresTemplateVersions
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

    const validator =
        new TemplateDeprecationValidator();

    /*
     * Non-deprecated template.
     */
    const currentTemplate =
        createTemplate(
            "current-template",
            "base"
        );

    const currentReport =
        validator.validate(
            createPlan(
                currentTemplate,
                []
            )
        );

    if (
        !currentReport.compatible
    ) {

        throw new Error(
            "A current template was rejected."
        );

    }

    if (
        currentReport.issues.length !==
        0
    ) {

        throw new Error(
            "A current template produced a deprecation warning."
        );

    }

    /*
     * Deprecated template with replacement.
     */
    const legacyTemplate =
        createTemplate(
            "legacy-template",
            "base",
            {
                deprecated:
                    true,

                replacementTemplate:
                    "modern-template"
            }
        );

    const deprecatedReport =
        validator.validate(
            createPlan(
                legacyTemplate,
                []
            )
        );

    if (
        !deprecatedReport.compatible
    ) {

        throw new Error(
            "A deprecated template incorrectly blocked generation."
        );

    }

    if (
        deprecatedReport.issues.length !==
        1
    ) {

        throw new Error(
            `Expected 1 deprecation warning but received ${deprecatedReport.issues.length}.`
        );

    }

    const deprecatedIssue =
        deprecatedReport.issues[0];

    if (
        deprecatedIssue?.type !==
        "deprecated"
    ) {

        throw new Error(
            "The deprecation issue type was incorrect."
        );

    }

    if (
        deprecatedIssue.warning !==
        true
    ) {

        throw new Error(
            "The deprecation issue was not marked as a warning."
        );

    }

    if (
        !deprecatedIssue.message.includes(
            "modern-template"
        )
    ) {

        throw new Error(
            "The replacement template was not included in the warning."
        );

    }

    /*
     * Deprecated template without replacement.
     */
    const noReplacement =
        createTemplate(
            "old-feature",
            "feature",
            {
                deprecated:
                    true
            }
        );

    const noReplacementReport =
        validator.validate(
            createPlan(
                currentTemplate,
                [
                    noReplacement
                ]
            )
        );

    if (
        !noReplacementReport
            .issues[0]
            ?.message
            .includes(
                "No replacement template is specified."
            )
    ) {

        throw new Error(
            "The missing replacement fallback was not displayed."
        );

    }

    /*
     * Combined version report:
     * warning only remains compatible.
     */
    const reportService =
        new TemplateVersionReportService();

    const warningOnlyReport =
        reportService.createReport(
            createPlan(
                legacyTemplate,
                []
            ),
            "1.0.0"
        );

    if (
        !warningOnlyReport.compatible
    ) {

        throw new Error(
            "A warning-only report was marked incompatible."
        );

    }

    if (
        warningOnlyReport.issues.length !==
        1
    ) {

        throw new Error(
            "The combined warning-only report was incorrect."
        );

    }

    /*
     * Blocking engine issue plus deprecation warning.
     */
    const deprecatedModernTemplate =
        createTemplate(
            "deprecated-modern",
            "base",
            {
                deprecated:
                    true,

                replacementTemplate:
                    "modern-v2",

                minGenesisVersion:
                    "2.0.0"
            }
        );

    const blockingReport =
        reportService.createReport(
            createPlan(
                deprecatedModernTemplate,
                []
            ),
            "1.0.0"
        );

    if (
        blockingReport.compatible
    ) {

        throw new Error(
            "A blocking version report was marked compatible."
        );

    }

    if (
        !blockingReport.issues.some(
            (issue) =>
                issue.type ===
                "engine-too-old"
        )
    ) {

        throw new Error(
            "The blocking engine issue was not included."
        );

    }

    if (
        !blockingReport.issues.some(
            (issue) =>
                issue.type ===
                "deprecated"
        )
    ) {

        throw new Error(
            "The deprecation warning was not included with the blocking issue."
        );

    }

    console.log(
        "Template deprecation validator test completed successfully."
    );

}

main();