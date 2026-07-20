import {
    RegistryPublishEntry,
    RegistryPublishManifest,
    TemplatePublishRequest,
    TemplatePublishResult
} from "../lib/models";

async function main(): Promise<void> {

    const request: TemplatePublishRequest = {

        templateId:
            "nextjs",

        version:
            "4.0.0",

        packagePath:
            "/packages/nextjs-4.0.0.zip",

        registryId:
            "official"

    };

    if (
        request.templateId !==
        "nextjs"
    ) {

        throw new Error(
            "Publish request template ID mismatch."
        );

    }

    const result: TemplatePublishResult = {

        success:
            true,

        message:
            "Published successfully.",

        registryId:
            "official",

        templateId:
            "nextjs",

        version:
            "4.0.0",

        publishedAt:
            new Date()

    };

    if (
        !result.success
    ) {

        throw new Error(
            "Publish result success mismatch."
        );

    }

    const entry: RegistryPublishEntry = {

        templateId:
            "nextjs",

        version:
            "4.0.0",

        packagePath:
            "/packages/nextjs-4.0.0.zip",

        sha256:
            "a".repeat(
                64
            ),

        publishedAt:
            new Date()

    };

    const manifest: RegistryPublishManifest = {

        registryId:
            "official",

        generatedAt:
            new Date(),

        packages: [
            entry
        ]

    };

    if (
        manifest.packages.length !==
        1
    ) {

        throw new Error(
            "Publish manifest package count mismatch."
        );

    }

    if (
        manifest.packages[0]?.templateId !==
        "nextjs"
    ) {

        throw new Error(
            "Publish manifest template mismatch."
        );

    }

    console.log(
        "Template publish request model verified."
    );

    console.log(
        "Template publish result model verified."
    );

    console.log(
        "Registry publish entry model verified."
    );

    console.log(
        "Registry publish manifest model verified."
    );

    console.log(
        "Template publish models test completed successfully."
    );

}

main().catch(
    (error: unknown) => {

        console.error(
            "Template publish models test failed.",
            error
        );

        process.exitCode =
            1;

    }
);