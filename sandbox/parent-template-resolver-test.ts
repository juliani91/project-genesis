import {
    TemplatePackage
} from "../lib/models";

import {
    ParentTemplateResolver
} from "../lib/services";

function createTemplate(
    id: string,
    parent?: string
): TemplatePackage {

    return {
        manifest: {
            id,
            extends: parent,
            name: id,
            version: "1.0.0",
            description: "",
            author: "Test"
        },

        path: id,

        descriptors: {}
    };

}

function main(): void {

    const resolver =
        new ParentTemplateResolver();

    /*
     * Scenario 1:
     * Resolve a direct parent.
     */
    const base =
        createTemplate(
            "base-web"
        );

    const child =
        createTemplate(
            "nextjs-app",
            "base-web"
        );

    const grandchild =
        createTemplate(
            "nextjs-api",
            "nextjs-app"
        );

    const templates = [
        base,
        child,
        grandchild
    ];

    const resolvedParent =
        resolver.resolveParent(
            child,
            templates
        );

    if (!resolvedParent) {

        throw new Error(
            "Parent template was not resolved."
        );

    }

    if (
        resolvedParent.manifest.id !==
        "base-web"
    ) {

        throw new Error(
            "Incorrect parent template resolved."
        );

    }

    /*
     * Scenario 2:
     * Root template has no parent.
     */
    const noParent =
        resolver.resolveParent(
            base,
            templates
        );

    if (
        noParent !==
        undefined
    ) {

        throw new Error(
            "Root template unexpectedly resolved a parent."
        );

    }

    /*
     * Scenario 3:
     * Resolve a valid three-template chain.
     */
    const chain =
        resolver.resolveChain(
            grandchild,
            templates
        );

    console.log(
        "Resolved chain:",
        chain.map(
            (template) =>
                template.manifest.id
        )
    );

    if (chain.length !== 3) {

        throw new Error(
            `Expected a 3-template chain but received ${chain.length}.`
        );

    }

    if (
        chain[0].manifest.id !==
            "nextjs-api" ||
        chain[1].manifest.id !==
            "nextjs-app" ||
        chain[2].manifest.id !==
            "base-web"
    ) {

        throw new Error(
            "The inheritance chain order was incorrect."
        );

    }

    /*
     * Scenario 4:
     * Missing parent.
     */
    let missingParentThrown =
        false;

    try {

        resolver.resolveChain(
            createTemplate(
                "broken",
                "missing-parent"
            ),
            templates
        );

    } catch (error) {

        missingParentThrown =
            true;

        console.log(
            error instanceof Error
                ? error.message
                : error
        );

    }

    if (!missingParentThrown) {

        throw new Error(
            "Missing parent template was not detected."
        );

    }

    /*
     * Scenario 5:
     * Two-template cycle.
     *
     * template-a -> template-b -> template-a
     */
    const templateA =
        createTemplate(
            "template-a",
            "template-b"
        );

    const templateB =
        createTemplate(
            "template-b",
            "template-a"
        );

    let twoTemplateCycleThrown =
        false;

    try {

        resolver.resolveChain(
            templateA,
            [
                templateA,
                templateB
            ]
        );

    } catch (error) {

        twoTemplateCycleThrown =
            true;

        const message =
            error instanceof Error
                ? error.message
                : String(error);

        console.log(message);

        if (
            !message.includes(
                "Circular template inheritance detected"
            )
        ) {

            throw new Error(
                `Unexpected circular-reference error: ${message}`
            );

        }

    }

    if (!twoTemplateCycleThrown) {

        throw new Error(
            "A two-template inheritance cycle was not detected."
        );

    }

    /*
     * Scenario 6:
     * Self-reference.
     *
     * self-referencing -> self-referencing
     */
    const selfReferencing =
        createTemplate(
            "self-referencing",
            "self-referencing"
        );

    let selfReferenceThrown =
        false;

    try {

        resolver.resolveChain(
            selfReferencing,
            [
                selfReferencing
            ]
        );

    } catch (error) {

        selfReferenceThrown =
            true;

        const message =
            error instanceof Error
                ? error.message
                : String(error);

        console.log(message);

        if (
            !message.includes(
                "Circular template inheritance detected"
            )
        ) {

            throw new Error(
                `Unexpected self-reference error: ${message}`
            );

        }

    }

    if (!selfReferenceThrown) {

        throw new Error(
            "A self-referencing template was not detected."
        );

    }

    /*
     * Scenario 7:
     * Three-template cycle.
     *
     * template-a -> template-b -> template-c -> template-a
     */
    const circularA =
        createTemplate(
            "template-a",
            "template-b"
        );

    const circularB =
        createTemplate(
            "template-b",
            "template-c"
        );

    const circularC =
        createTemplate(
            "template-c",
            "template-a"
        );

    let threeTemplateCycleThrown =
        false;

    try {

        resolver.resolveChain(
            circularA,
            [
                circularA,
                circularB,
                circularC
            ]
        );

    } catch (error) {

        threeTemplateCycleThrown =
            true;

        const message =
            error instanceof Error
                ? error.message
                : String(error);

        console.log(message);

        if (
            !message.includes(
                "Circular template inheritance detected"
            )
        ) {

            throw new Error(
                `Unexpected three-template-cycle error: ${message}`
            );

        }

    }

    if (!threeTemplateCycleThrown) {

        throw new Error(
            "A three-template inheritance cycle was not detected."
        );

    }

    /*
     * Scenario 8:
     * One duplicate template ID.
     */
    const duplicateBaseOne =
        createTemplate(
            "duplicate-base"
        );

    const duplicateBaseTwo =
        createTemplate(
            "duplicate-base"
        );

    const duplicateChild =
        createTemplate(
            "duplicate-child",
            "duplicate-base"
        );

    let duplicateIdThrown =
        false;

    try {

        resolver.resolveChain(
            duplicateChild,
            [
                duplicateBaseOne,
                duplicateBaseTwo,
                duplicateChild
            ]
        );

    } catch (error) {

        duplicateIdThrown =
            true;

        const message =
            error instanceof Error
                ? error.message
                : String(error);

        console.log(message);

        if (
            !message.includes(
                "Duplicate template IDs detected"
            )
        ) {

            throw new Error(
                `Unexpected duplicate-ID error: ${message}`
            );

        }

        if (
            !message.includes(
                "duplicate-base"
            )
        ) {

            throw new Error(
                "The duplicate template ID was not identified in the error."
            );

        }

    }

    if (!duplicateIdThrown) {

        throw new Error(
            "Duplicate template IDs were not rejected."
        );

    }

    /*
     * Scenario 9:
     * Multiple duplicate template IDs.
     */
    let multipleDuplicatesThrown =
        false;

    try {

        resolver.validateUniqueTemplateIds(
            [
                createTemplate(
                    "duplicate-a"
                ),
                createTemplate(
                    "duplicate-a"
                ),
                createTemplate(
                    "duplicate-b"
                ),
                createTemplate(
                    "duplicate-b"
                )
            ]
        );

    } catch (error) {

        multipleDuplicatesThrown =
            true;

        const message =
            error instanceof Error
                ? error.message
                : String(error);

        console.log(message);

        if (
            !message.includes(
                "duplicate-a"
            ) ||
            !message.includes(
                "duplicate-b"
            )
        ) {

            throw new Error(
                "The error did not report every duplicate template ID."
            );

        }

    }

    if (!multipleDuplicatesThrown) {

        throw new Error(
            "Multiple duplicate template IDs were not rejected."
        );

    }

    console.log(
        "Parent template resolver test completed successfully."
    );

}

main();