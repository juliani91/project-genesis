import path from "path";

import { TemplateRenderer } from "../lib/services";
import {
    FileDescriptor,
    VariableCollection
} from "../lib/models";

async function main(): Promise<void> {

    const sourcePath = path.join(
        process.cwd(),
        "templates",
        "project-genesis",
        "files",
        "README.md"
    );

    const variables =
        new VariableCollection();

    variables.set(
        "PROJECT_NAME",
        "Renderer Test Project"
    );

    variables.set(
        "CLIENT_NAME",
        "Renderer Test Client"
    );

    variables.set(
        "PROJECT_DESCRIPTION",
        "A focused test of render mode."
    );

    variables.set(
        "TECH_STACK",
        "TypeScript"
    );

    variables.set(
        "CREATED_DATE",
        "2026-07-10"
    );

    const renderer =
        new TemplateRenderer();

    const result =
        await renderer.render(
            sourcePath,
            {
                source: "README.md",
                destination: "README.md",
                mode: "render"
            },
            variables
        );

    console.log(result.contents);

    const copySourcePath = path.join(
        process.cwd(),
        "templates",
        "project-genesis",
        "files",
        "copy-test.txt"
    );

    const copyResult =
        await renderer.render(
            copySourcePath,
            {
                source: "copy-test.txt",
                destination: "copy-test.txt",
                mode: "copy"
            },
            variables
        );

    console.log(
        copyResult.contents.toString()
    );

    const incompleteVariables =
        new VariableCollection();

    incompleteVariables.set(
        "PROJECT_NAME",
        "Incomplete Variable Test"
    );

    try {

        await renderer.render(
            sourcePath,
            {
                source: "README.md",
                destination: "README.md",
                mode: "render"
            },
            incompleteVariables
        );

        console.error(
            "Unresolved-variable test unexpectedly succeeded."
        );

    } catch (error) {

        console.log(
            error instanceof Error
                ? error.message
                : error
        );

    }

}

main().catch((error: unknown) => {

    console.error(
        "Renderer test failed.",
        error
    );

    process.exitCode = 1;

});