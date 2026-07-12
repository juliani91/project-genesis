import {
    WizardAnswer
} from "../lib/models";

import {
    PreparationService,
    TemplateDiscoveryService
} from "../lib/services";

async function main(): Promise<void> {

    const discoveryService =
        new TemplateDiscoveryService();

    const templates =
        await discoveryService.discover();

    const template = templates.find(
        (item) =>
            item.manifest.id ===
            "project-genesis"
    );

    if (!template) {

        throw new Error(
            "Project Genesis template was not found."
        );

    }

    const answers: WizardAnswer[] = [
        {
            key: "PROJECT_NAME",
            value: "Wizard Preparation Test"
        },
        {
            key: "CLIENT_NAME",
            value: "Internal Test Client"
        },
        {
            key: "PROJECT_DESCRIPTION",
            value: "Tests wizard-driven preparation."
        },
        {
            key: "TECH_STACK",
            value: "TypeScript"
        },
        {
            key: "USE_DOCKER",
            value: "false"
        },
        {
            key: "USE_DATABASE",
            value: "false"
        }
    ];

    const preparationService =
        new PreparationService();

    const result =
        await preparationService.prepare(
            template,
            answers
        );

    if (
        !result.success ||
        !result.template
    ) {

        throw new Error(
            [
                "Wizard-driven preparation failed:",
                ...result.errors
            ].join(" ")
        );

    }

    const variables =
        result.template.variables;

    const projectName =
        variables.get("PROJECT_NAME");

    const clientName =
        variables.get("CLIENT_NAME");

    const createdDate =
        variables.get("CREATED_DATE");

    console.log(
        "PROJECT_NAME:",
        projectName
    );

    console.log(
        "CLIENT_NAME:",
        clientName
    );

    console.log(
        "CREATED_DATE:",
        createdDate
    );

    if (
        projectName !==
        "Wizard Preparation Test"
    ) {

        throw new Error(
            "Preparation did not build PROJECT_NAME from the wizard answers."
        );

    }

    if (
        clientName !==
        "Internal Test Client"
    ) {

        throw new Error(
            "Preparation did not build CLIENT_NAME from the wizard answers."
        );

    }

    if (!createdDate) {

        throw new Error(
            "Preparation did not add the built-in CREATED_DATE variable."
        );

    }

    const parsedCreatedDate =
        Date.parse(createdDate);

    if (Number.isNaN(parsedCreatedDate)) {

        throw new Error(
            "CREATED_DATE was added, but it is not a valid ISO date."
        );

    }

    console.log(
        "Wizard preparation test completed successfully."
    );

}

main().catch((error: unknown) => {

    console.error(
        "Wizard preparation test failed.",
        error
    );

    process.exitCode = 1;

});