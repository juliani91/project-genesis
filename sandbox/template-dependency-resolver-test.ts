import {
    TemplatePackage
} from "../lib/models";

import {
    TemplateDependencyResolver
} from "../lib/services";

function createFeature(
    id: string,
    requires:
        string[] = []
): TemplatePackage {

    return {
        manifest: {
            id,
            name: id,
            version: "1.0.0",
            description: "",
            author: "Test",
            role: "feature",
            requires
        },

        path:
            `C:/templates/${id}`,

        descriptors: {}
    };

}

function createBase(
    id: string
): TemplatePackage {

    return {
        manifest: {
            id,
            name: id,
            version: "1.0.0",
            description: "",
            author: "Test",
            role: "base"
        },

        path:
            `C:/templates/${id}`,

        descriptors: {}
    };

}

function main(): void {

    const databaseSupport =
        createFeature(
            "database-support"
        );

    const postgresql =
        createFeature(
            "postgresql",
            [
                "database-support"
            ]
        );

    const migrations =
        createFeature(
            "migrations",
            [
                "postgresql"
            ]
        );

    const docker =
        createFeature(
            "docker"
        );

    const resolver =
        new TemplateDependencyResolver();

    const resolved =
        resolver.resolve(
            [
                migrations,
                docker
            ],
            [
                databaseSupport,
                postgresql,
                migrations,
                docker
            ]
        );

    const resolvedIds =
        resolved.map(
            (template) =>
                template.manifest.id
        );

    console.log(
        "Resolved dependencies:",
        resolvedIds
    );

    const expectedIds = [
        "database-support",
        "postgresql",
        "migrations",
        "docker"
    ];

    if (
        JSON.stringify(
            resolvedIds
        ) !==
        JSON.stringify(
            expectedIds
        )
    ) {

        throw new Error(
            [
                "Dependency order was incorrect.",
                `Expected: ${expectedIds.join(", ")}`,
                `Actual: ${resolvedIds.join(", ")}`
            ].join(" ")
        );

    }

    /*
     * Duplicate dependency is included once.
     */
    const duplicateResolved =
        resolver.resolve(
            [
                postgresql,
                databaseSupport
            ],
            [
                databaseSupport,
                postgresql
            ]
        );

    if (
        duplicateResolved.length !==
        2
    ) {

        throw new Error(
            "A duplicate dependency was included more than once."
        );

    }

    /*
     * Missing dependency.
     */
    let missingThrown =
        false;

    try {

        resolver.resolve(
            [
                createFeature(
                    "broken",
                    [
                        "missing"
                    ]
                )
            ],
            []
        );

    } catch (error) {

        missingThrown =
            true;

        const message =
            error instanceof Error
                ? error.message
                : String(error);

        if (
            !message.includes(
                "Unable to resolve template dependency"
            )
        ) {

            throw new Error(
                `Unexpected missing-dependency error: ${message}`
            );

        }

    }

    if (!missingThrown) {

        throw new Error(
            "A missing dependency was not rejected."
        );

    }

    /*
     * Dependency on a base template.
     */
    let baseDependencyThrown =
        false;

    try {

        const base =
            createBase(
                "another-base"
            );

        resolver.resolve(
            [
                createFeature(
                    "invalid-feature",
                    [
                        "another-base"
                    ]
                )
            ],
            [
                base
            ]
        );

    } catch (error) {

        baseDependencyThrown =
            true;

        const message =
            error instanceof Error
                ? error.message
                : String(error);

        if (
            !message.includes(
                "must be a feature template"
            )
        ) {

            throw new Error(
                `Unexpected base-dependency error: ${message}`
            );

        }

    }

    if (!baseDependencyThrown) {

        throw new Error(
            "A dependency on a base template was not rejected."
        );

    }

    /*
     * Circular dependency.
     */
    const featureA =
        createFeature(
            "feature-a",
            [
                "feature-b"
            ]
        );

    const featureB =
        createFeature(
            "feature-b",
            [
                "feature-a"
            ]
        );

    let cycleThrown =
        false;

    try {

        resolver.resolve(
            [
                featureA
            ],
            [
                featureA,
                featureB
            ]
        );

    } catch (error) {

        cycleThrown =
            true;

        const message =
            error instanceof Error
                ? error.message
                : String(error);

        if (
            !message.includes(
                "Circular template dependency detected"
            )
        ) {

            throw new Error(
                `Unexpected dependency-cycle error: ${message}`
            );

        }

    }

    if (!cycleThrown) {

        throw new Error(
            "A circular template dependency was not rejected."
        );

    }

    console.log(
        "Template dependency resolver test completed successfully."
    );

}

main();