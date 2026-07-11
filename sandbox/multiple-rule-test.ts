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

    const template = templates.find(
        (item) =>
            item.manifest.id === "project-genesis"
    );

    if (!template) {

        throw new Error(
            "Project Genesis template was not found."
        );

    }

    const preparationService =
        new PreparationService();

    const preparationResult =
        await preparationService.prepare(template);

    if (
        !preparationResult.success ||
        !preparationResult.template
    ) {

        throw new Error(
            [
                "Template preparation failed:",
                ...preparationResult.errors
            ].join(" ")
        );

    }

    const preparedTemplate =
        preparationResult.template;

    preparedTemplate.variables.set(
        "PROJECT_NAME",
        "Multiple Rule Test"
    );

    preparedTemplate.variables.set(
        "CLIENT_NAME",
        "Internal Test Client"
    );

    preparedTemplate.variables.set(
        "PROJECT_DESCRIPTION",
        "A test of multiple generation rules."
    );

    preparedTemplate.variables.set(
        "TECH_STACK",
        "TypeScript and PostgreSQL"
    );

    preparedTemplate.variables.set(
        "CREATED_DATE",
        "2026-07-11"
    );

    const planner =
        new GenerationPlanner();

    const outputPath = path.join(
        process.cwd(),
        "sandbox-output",
        "multiple-rule-test"
    );

    const hasPostgresFolder = (
        plan: Awaited<
            ReturnType<
                GenerationPlanner["createPlan"]
            >
        >
    ): boolean => {

        return plan.folders.some(
            (folder) =>
                folder.relativePath ===
                "Database/PostgreSQL"
        );

    };

    const hasPostgresFile = (
        plan: Awaited<
            ReturnType<
                GenerationPlanner["createPlan"]
            >
        >
    ): boolean => {

        return plan.files.some(
            (file) =>
                file.relativePath ===
                "Database/PostgreSQL/README.md"
        );

    };

    // Case 1:
    // Both rules pass.
    preparedTemplate.variables.set(
        "USE_DATABASE",
        "true"
    );

    preparedTemplate.variables.set(
        "DATABASE",
        "postgres"
    );

    const allRulesPassPlan =
        await planner.createPlan(
            preparedTemplate,
            outputPath
        );

    console.log(
        "All rules pass folder:",
        hasPostgresFolder(
            allRulesPassPlan
        )
    );

    console.log(
        "All rules pass file:",
        hasPostgresFile(
            allRulesPassPlan
        )
    );

    // Case 2:
    // Database is enabled, but the type is wrong.
    preparedTemplate.variables.set(
        "DATABASE",
        "sqlite"
    );

    const wrongDatabasePlan =
        await planner.createPlan(
            preparedTemplate,
            outputPath
        );

    console.log(
        "Wrong database folder:",
        hasPostgresFolder(
            wrongDatabasePlan
        )
    );

    console.log(
        "Wrong database file:",
        hasPostgresFile(
            wrongDatabasePlan
        )
    );

    // Case 3:
    // PostgreSQL is selected, but database use is disabled.
    preparedTemplate.variables.set(
        "USE_DATABASE",
        "false"
    );

    preparedTemplate.variables.set(
        "DATABASE",
        "postgres"
    );

    const databaseDisabledPlan =
        await planner.createPlan(
            preparedTemplate,
            outputPath
        );

    console.log(
        "Database disabled folder:",
        hasPostgresFolder(
            databaseDisabledPlan
        )
    );

    console.log(
        "Database disabled file:",
        hasPostgresFile(
            databaseDisabledPlan
        )
    );

    if (
        !hasPostgresFolder(
            allRulesPassPlan
        ) ||
        !hasPostgresFile(
            allRulesPassPlan
        )
    ) {

        throw new Error(
            "PostgreSQL descriptors were excluded when all rules passed."
        );

    }

    if (
        hasPostgresFolder(
            wrongDatabasePlan
        ) ||
        hasPostgresFile(
            wrongDatabasePlan
        )
    ) {

        throw new Error(
            "PostgreSQL descriptors were included when DATABASE was not postgres."
        );

    }

    if (
        hasPostgresFolder(
            databaseDisabledPlan
        ) ||
        hasPostgresFile(
            databaseDisabledPlan
        )
    ) {

        throw new Error(
            "PostgreSQL descriptors were included when USE_DATABASE was false."
        );

    }

    console.log(
        "Multiple generation rule test completed successfully."
    );

}

main().catch((error: unknown) => {

    console.error(
        "Multiple generation rule test failed.",
        error
    );

    process.exitCode = 1;

});