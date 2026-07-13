import {
    TemplateManifest
} from "../lib/models";

function main(): void {

    const nextjs:
        TemplateManifest = {
        id:
            "nextjs",

        name:
            "Next.js",

        version:
            "1.0.0",

        description:
            "Next.js base template.",

        author:
            "Test",

        role:
            "base",

        provides: [
            "node",
            "typescript",
            "react"
        ],

        requiresCapabilities: [],

        conflictsWith: [
            "dotnet"
        ]
    };

    const playwright:
        TemplateManifest = {
        id:
            "playwright",

        name:
            "Playwright",

        version:
            "1.0.0",

        description:
            "Playwright testing feature.",

        author:
            "Test",

        role:
            "feature",

        requires: [
            "testing-support"
        ],

        provides: [
            "playwright",
            "browser-testing"
        ],

        requiresCapabilities: [
            "node",
            "typescript"
        ],

        conflictsWith: []
    };

    const legacy:
        TemplateManifest = {
        id:
            "legacy",

        name:
            "Legacy",

        version:
            "1.0.0",

        description:
            "",

        author:
            "Test"
    };

    if (
        nextjs.provides?.length !==
        3
    ) {

        throw new Error(
            "Provided capabilities were not preserved."
        );

    }

    if (
        nextjs.conflictsWith?.[0] !==
        "dotnet"
    ) {

        throw new Error(
            "Conflicting capabilities were not preserved."
        );

    }

    if (
        playwright.requires?.[0] !==
        "testing-support"
    ) {

        throw new Error(
            "Template dependencies were not preserved."
        );

    }

    if (
        playwright
            .requiresCapabilities
            ?.length !==
        2
    ) {

        throw new Error(
            "Required capabilities were not preserved."
        );

    }

    if (
        legacy.provides !==
        undefined
    ) {

        throw new Error(
            "A legacy manifest unexpectedly received provided capabilities."
        );

    }

    if (
        legacy.requiresCapabilities !==
        undefined
    ) {

        throw new Error(
            "A legacy manifest unexpectedly received capability requirements."
        );

    }

    if (
        legacy.conflictsWith !==
        undefined
    ) {

        throw new Error(
            "A legacy manifest unexpectedly received capability conflicts."
        );

    }

    console.log(
        "Template capability manifest test completed successfully."
    );

}

main();