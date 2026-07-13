import {
    ResolvedTemplateRegistry
} from "../lib/models";

import {
    TemplateRegistryPresenter
} from "../lib/services";

function createRegistry():
    ResolvedTemplateRegistry {

    return {

        id:
            "official",

        name:
            "Official Registry",

        type:
            "remote",

        resolvedLocation:
            "https://registry.example.com",

        description:
            "Official template registry.",

        templates: [
            {
                templateId:
                    "nextjs",

                version:
                    "3.2.0",

                name:
                    "Next.js"
            }
        ]

    };

}

function main(): void {

    const presenter =
        new TemplateRegistryPresenter();

    const registry =
        createRegistry();

    const sources = [
        "local",
        "network",
        "cache"
    ] as const;

    for (
        const source
        of sources
    ) {

        const preview =
            presenter.format(
                registry,
                source
            );

        const expected =
            `Source      : ${
                source.charAt(0).toUpperCase() +
                source.slice(1)
            }`;

        if (
            !preview.includes(
                expected
            )
        ) {

            throw new Error(
                `Preview missing source: ${expected}`
            );

        }

    }

    /*
     * Source remains optional.
     */
    const defaultPreview =
        presenter.format(
            registry
        );

    if (
        defaultPreview.includes(
            "Source      :"
        )
    ) {

        throw new Error(
            "The default registry preview unexpectedly displayed a source."
        );

    }

    console.log(
        "Template registry preview test completed successfully."
    );

}

main();