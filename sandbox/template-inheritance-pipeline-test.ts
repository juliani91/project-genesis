import {
    TemplateDiscoveryService,
    TemplateInheritanceService
} from "../lib/services";

async function main(): Promise<void> {

    const discoveryService =
        new TemplateDiscoveryService();

    const templates =
        await discoveryService.discover();

    const template =
        templates.find(
            (item) =>
                item.manifest.id ===
                "project-genesis"
        );

    if (!template) {

        throw new Error(
            "Project Genesis template was not found."
        );

    }

    const inheritanceService =
        new TemplateInheritanceService();

    const resolved =
        await inheritanceService.resolve(
            template,
            templates
        );

    const wizard =
        resolved.descriptors.wizard;

    const folders =
        resolved.descriptors.folders;

    const files =
        resolved.descriptors.files;

    const resolvedFiles =
        resolved.descriptors.resolvedFiles;

    if (!wizard) {

        throw new Error(
            "The resolved template did not contain a wizard."
        );

    }

    if (
        !folders ||
        folders.length === 0
    ) {

        throw new Error(
            "The resolved template did not contain folder descriptors."
        );

    }

    if (
        !files ||
        files.length === 0
    ) {

        throw new Error(
            "The resolved template did not contain file descriptors."
        );

    }

    if (
        !resolvedFiles ||
        resolvedFiles.length === 0
    ) {

        throw new Error(
            "The resolved template did not contain source-owned files."
        );

    }

    if (
        resolvedFiles.length !==
        files.length
    ) {

        throw new Error(
            [
                "Resolved file ownership count did not match",
                "the resolved descriptor count."
            ].join(" ")
        );

    }

    for (const resolvedFile of resolvedFiles) {

        if (
            resolvedFile.templatePath !==
            template.path
        ) {

            throw new Error(
                [
                    "The root template file had an unexpected owner:",
                    resolvedFile.descriptor.destination
                ].join(" ")
            );

        }

    }

    if (
        resolved.manifest.id !==
        "project-genesis"
    ) {

        throw new Error(
            "The resolved template manifest did not remain the child manifest."
        );

    }

    if (
        resolved.manifest.extends
    ) {

        throw new Error(
            "The Project Genesis root template unexpectedly resolved a parent."
        );

    }

    console.log(
        "Resolved template:"
    );

    console.log(
        JSON.stringify(
            {
                id:
                    resolved.manifest.id,

                parent:
                    resolved.manifest.extends ??
                    null,

                wizardSteps:
                    wizard.steps.map(
                        (step) =>
                            step.id
                    ),

                folders:
                    folders.map(
                        (folder) =>
                            folder.path
                    ),

                files:
                    resolvedFiles.map(
                        (file) => ({
                            destination:
                                file.descriptor
                                    .destination,

                            owner:
                                file.templatePath
                        })
                    )
            },
            null,
            2
        )
    );

    console.log(
        "Template inheritance pipeline test completed successfully."
    );

}

main().catch(
    (error: unknown) => {

        console.error(
            "Template inheritance pipeline test failed.",
            error
        );

        process.exitCode = 1;

    }
);