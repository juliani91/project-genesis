import path from "path";

import {
    GenerationPlanner,
    PreparationService,
    TemplateDiscoveryService
} from "../lib/services";

async function main(): Promise<void> {

    const discoveryService =
        new TemplateDiscoveryService();

    const templates =
        await discoveryService.discover();

    if (templates.length === 0) {
        console.log("No templates found.");
        return;
    }

    const preparationService =
        new PreparationService();

    const preparationResult =
        await preparationService.prepare(
            templates[0]
        );

if (
    !preparationResult.success ||
    !preparationResult.template
) {
    console.error(
        "Template preparation failed.",
        preparationResult.errors
    );

    return;
}

const preparedTemplate =
    preparationResult.template;

preparedTemplate.variables.set(
    "PROJECT_NAME",
    "Planner Test Project"
);

preparedTemplate.variables.set(
    "CLIENT_NAME",
    "Internal Test Client"
);

preparedTemplate.variables.set(
    "PROJECT_DESCRIPTION",
    "A test project used to verify generation planning."
);

preparedTemplate.variables.set(
    "TECH_STACK",
    "TypeScript"
);

preparedTemplate.variables.set(
    "CREATED_DATE",
    "2026-07-10"
);

const outputPath = path.join(
    process.cwd(),
    "sandbox-output",
    "planned-project"
);

const planner =
    new GenerationPlanner();

const plan =
    await planner.createPlan(
        preparedTemplate,
        outputPath
    );

    console.log(
        JSON.stringify(plan, null, 2)
    );

}

main().catch((error: unknown) => {

    console.error(
        "Planner test failed.",
        error
    );

    process.exitCode = 1;

});