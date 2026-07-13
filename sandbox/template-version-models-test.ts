import {
    VersionIssue,
    VersionReport
} from "../lib/models";

function main(): void {

    const engineTooOld:
        VersionIssue = {

        type:
            "engine-too-old",

        templateId:
            "nextjs",

        message:
            "Requires Project Genesis 2.0.0 or newer.",

        warning:
            false
    };

    if (
        engineTooOld.warning
    ) {

        throw new Error(
            "Engine compatibility issues should not be warnings."
        );

    }

    const deprecated:
        VersionIssue = {

        type:
            "deprecated",

        templateId:
            "legacy-template",

        message:
            "Template is deprecated.",

        warning:
            true
    };

    if (
        !deprecated.warning
    ) {

        throw new Error(
            "Deprecation should be represented as a warning."
        );

    }

    const report:
        VersionReport = {

        compatible:
            false,

        issues: [
            engineTooOld,
            deprecated
        ]
    };

    if (
        report.compatible
    ) {

        throw new Error(
            "The report compatibility flag was incorrect."
        );

    }

    if (
        report.issues.length !==
        2
    ) {

        throw new Error(
            "Unexpected issue count."
        );

    }

    if (
        report.issues.filter(
            (issue) =>
                issue.warning
        ).length !==
        1
    ) {

        throw new Error(
            "Warning detection failed."
        );

    }

    console.log(
        "Template version models test completed successfully."
    );

}

main();