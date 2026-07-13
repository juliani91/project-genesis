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
            "3.2.0",

        description:
            "Next.js base template.",

        author:
            "Test",

        role:
            "base",

        minGenesisVersion:
            "0.14.0",

        maxGenesisVersion:
            "2.0.0",

        deprecated:
            false
    };

    const playwright:
        TemplateManifest = {
        id:
            "playwright",

        name:
            "Playwright",

        version:
            "1.4.0",

        description:
            "Playwright feature template.",

        author:
            "Test",

        role:
            "feature",

        requiresTemplateVersions: {
            nextjs:
                ">=3.0.0",

            docker:
                "^1.5.0"
        }
    };

    const legacy:
        TemplateManifest = {
        id:
            "legacy-template",

        name:
            "Legacy Template",

        version:
            "1.0.0",

        description:
            "",

        author:
            "Test",

        deprecated:
            true,

        replacementTemplate:
            "modern-template"
    };

    if (
        nextjs.minGenesisVersion !==
        "0.14.0"
    ) {

        throw new Error(
            "Minimum Genesis version was not preserved."
        );

    }

    if (
        nextjs.maxGenesisVersion !==
        "2.0.0"
    ) {

        throw new Error(
            "Maximum Genesis version was not preserved."
        );

    }

    if (
        playwright
            .requiresTemplateVersions
            ?.nextjs !==
        ">=3.0.0"
    ) {

        throw new Error(
            "Required Next.js template version was not preserved."
        );

    }

    if (
        playwright
            .requiresTemplateVersions
            ?.docker !==
        "^1.5.0"
    ) {

        throw new Error(
            "Required Docker template version was not preserved."
        );

    }

    if (
        !legacy.deprecated
    ) {

        throw new Error(
            "Template deprecation metadata was not preserved."
        );

    }

    if (
        legacy.replacementTemplate !==
        "modern-template"
    ) {

        throw new Error(
            "Replacement template metadata was not preserved."
        );

    }

    const backwardCompatible:
        TemplateManifest = {
        id:
            "backward-compatible",

        name:
            "Backward Compatible",

        version:
            "1.0.0",

        description:
            "",

        author:
            "Test"
    };

    if (
        backwardCompatible
            .minGenesisVersion !==
        undefined
    ) {

        throw new Error(
            "A legacy manifest unexpectedly received an engine constraint."
        );

    }

    if (
        backwardCompatible
            .requiresTemplateVersions !==
        undefined
    ) {

        throw new Error(
            "A legacy manifest unexpectedly received template constraints."
        );

    }

    if (
        backwardCompatible
            .deprecated !==
        undefined
    ) {

        throw new Error(
            "A legacy manifest unexpectedly received deprecation metadata."
        );

    }

    console.log(
        "Template version manifest test completed successfully."
    );

}

main();