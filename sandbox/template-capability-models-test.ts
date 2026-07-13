import {
    CompatibilityReport,
    TemplateCapability
} from "../lib/models";

function main(): void {

    const node:
        TemplateCapability = {

        id:
            "node",

        name:
            "Node.js",

        description:
            "JavaScript runtime"

    };

    if (
        node.id !==
        "node"
    ) {

        throw new Error(
            "Capability ID was incorrect."
        );

    }

    if (
        node.name !==
        "Node.js"
    ) {

        throw new Error(
            "Capability name was incorrect."
        );

    }

    const report:
        CompatibilityReport = {

        compatible:
            false,

        issues: [
            {

                type:
                    "missing-capability",

                capability:
                    "typescript",

                templateId:
                    "playwright",

                message:
                    "Playwright requires the typescript capability."

            },
            {

                type:
                    "conflict",

                capability:
                    "postgres",

                templateId:
                    "sqlite",

                message:
                    "SQLite conflicts with postgres."

            }
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
            "The report issue count was incorrect."
        );

    }

    if (
        report.issues[0].type !==
        "missing-capability"
    ) {

        throw new Error(
            "The missing capability issue type was incorrect."
        );

    }

    if (
        report.issues[1].type !==
        "conflict"
    ) {

        throw new Error(
            "The conflict issue type was incorrect."
        );

    }

    console.log(
        "Template capability models test completed successfully."
    );

}

main();