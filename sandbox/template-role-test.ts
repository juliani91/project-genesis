import {
    TemplateManifest,
    TemplateRole
} from "../lib/models";

function getRole(
    manifest: TemplateManifest
): TemplateRole {

    return manifest.role ??
        "base";

}

function main(): void {

    const baseManifest:
        TemplateManifest = {
        id: "nextjs",
        name: "Next.js",
        version: "1.0.0",
        description: "",
        author: "Test",
        role: "base"
    };

    const featureManifest:
        TemplateManifest = {
        id: "docker",
        name: "Docker",
        version: "1.0.0",
        description: "",
        author: "Test",
        role: "feature"
    };

    const legacyManifest:
        TemplateManifest = {
        id: "legacy",
        name: "Legacy",
        version: "1.0.0",
        description: "",
        author: "Test"
    };

    if (
        getRole(baseManifest) !==
        "base"
    ) {

        throw new Error(
            "The base template role was not preserved."
        );

    }

    if (
        getRole(featureManifest) !==
        "feature"
    ) {

        throw new Error(
            "The feature template role was not preserved."
        );

    }

    if (
        getRole(legacyManifest) !==
        "base"
    ) {

        throw new Error(
            "A legacy template did not default to the base role."
        );

    }

    console.log(
        "Template role test completed successfully."
    );

}

main();