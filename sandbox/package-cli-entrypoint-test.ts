import {
    execFile
} from "child_process";

import path from "path";

interface CliExecutionResult {

    exitCode:
        number;

    stdout:
        string;

    stderr:
        string;

}

async function runGenesis(
    args:
        readonly string[]
): Promise<CliExecutionResult> {

    const projectRoot =
        process.cwd();

    const commandArguments = [
        "/d",
        "/s",
        "/c",
        "npm",
        "run",
        "genesis",
        "--",
        ...args
    ];

    return new Promise<CliExecutionResult>(
        (
            resolve,
            reject
        ) => {

            const child =
                execFile(
                    process.platform ===
                        "win32"
                        ? "cmd.exe"
                        : "npm",
                    process.platform ===
                        "win32"
                        ? commandArguments
                        : [
                            "run",
                            "genesis",
                            "--",
                            ...args
                        ],
                    {
                        cwd:
                            projectRoot,

                        env: {
                            ...process.env,

                            NO_UPDATE_NOTIFIER:
                                "1",

                            npm_config_update_notifier:
                                "false"
                        },

                        timeout:
                            30000,

                        maxBuffer:
                            1024 *
                            1024 *
                            10,

                        windowsHide:
                            true
                    },
                    (
                        error,
                        stdout,
                        stderr
                    ) => {

                        if (
                            error &&
                            "killed" in error &&
                            error.killed
                        ) {

                            reject(
                                new Error(
                                    [
                                        "The Genesis CLI command timed out:",
                                        args.join(
                                            " "
                                        )
                                    ].join(" ")
                                )
                            );

                            return;

                        }

                        const exitCode =
                            error &&
                            "code" in error &&
                            typeof error.code ===
                                "number"
                                ? error.code
                                : 0;

                        resolve({
                            exitCode,

                            stdout:
                                String(
                                    stdout
                                )
                                    .replace(
                                        /\r\n/g,
                                        "\n"
                                    )
                                    .trim(),

                            stderr:
                                String(
                                    stderr
                                )
                                    .replace(
                                        /\r\n/g,
                                        "\n"
                                    )
                                    .trim()
                        });

                    }
                );

            child.once(
                "error",
                (error) => {

                    reject(
                        new Error(
                            [
                                "Unable to start the Genesis CLI.",
                                error.message
                            ].join(" ")
                        )
                    );

                }
            );

        }
    );

}

function requireIncludes(
    value:
        string,

    expected:
        string,

    label:
        string
): void {

    if (
        !value.includes(
            expected
        )
    ) {

        throw new Error(
            [
                `${label} was missing expected text:`,
                expected,
                "",
                "Actual output:",
                value ||
                    "(empty)"
            ].join("\n")
        );

    }

}

async function main(): Promise<void> {

    /*
     * Confirm that this test is being executed from the
     * Project Genesis repository root.
     */
    const expectedEntrypoint =
        path.join(
            process.cwd(),
            "cli",
            "genesis.ts"
        );

    if (
        path.basename(
            expectedEntrypoint
        ) !==
        "genesis.ts"
    ) {

        throw new Error(
            "The Genesis CLI entry-point path was incorrect."
        );

    }

    /*
     * Scenario 1:
     * Execute the real installed-package list command.
     *
     * The repository may or may not currently have installed
     * packages, so the test accepts either valid list state.
     */
    const listResult =
        await runGenesis([
            "list"
        ]);

    if (
        listResult.exitCode !==
        0
    ) {

        throw new Error(
            [
                "The real Genesis list command failed.",
                `Exit code: ${listResult.exitCode}`,
                `stdout: ${listResult.stdout}`,
                `stderr: ${listResult.stderr}`
            ].join("\n")
        );

    }

    const listHasEmptyState =
        listResult.stdout.includes(
            "No packages are installed."
        );

    const listHasInstalledState =
        listResult.stdout.includes(
            "Installed Packages"
        );

    if (
        !listHasEmptyState &&
        !listHasInstalledState
    ) {

        throw new Error(
            [
                "The real Genesis list command did not produce recognized output.",
                listResult.stdout
            ].join("\n")
        );

    }

    console.log(
        "Real CLI list routing verified."
    );

    /*
     * Scenario 2:
     * A missing uninstall target is a handled package command.
     *
     * It should not enter the interactive generator. It should
     * print the structured command message and exit with code 1.
     */
    const missingTemplateId =
        "genesis-entrypoint-missing-package";

    const missingVersion =
        "99.99.99";

    const uninstallResult =
        await runGenesis([
            "uninstall",
            missingTemplateId,
            missingVersion
        ]);

    if (
        uninstallResult.exitCode !==
        1
    ) {

        throw new Error(
            [
                "The missing-package uninstall returned the wrong exit code.",
                "Expected: 1",
                `Actual: ${uninstallResult.exitCode}`,
                `stdout: ${uninstallResult.stdout}`,
                `stderr: ${uninstallResult.stderr}`
            ].join("\n")
        );

    }

    requireIncludes(
        uninstallResult.stdout,
        [
            `Package "${missingTemplateId}"`,
            `version "${missingVersion}"`,
            "is not installed."
        ].join(" "),
        "The real Genesis uninstall output"
    );

    if (
        uninstallResult.stdout.includes(
            "Available Template Registries"
        )
    ) {

        throw new Error(
            "The uninstall command incorrectly entered interactive generation mode."
        );

    }

    console.log(
        "Real CLI uninstall routing and exit code verified."
    );

    /*
     * Scenario 3:
     * Verify the remove alias reaches the same command path.
     */
    const removeResult =
        await runGenesis([
            "remove",
            missingTemplateId,
            missingVersion
        ]);

    if (
        removeResult.exitCode !==
        1
    ) {

        throw new Error(
            [
                "The missing-package remove alias returned the wrong exit code.",
                "Expected: 1",
                `Actual: ${removeResult.exitCode}`
            ].join("\n")
        );

    }

    requireIncludes(
        removeResult.stdout,
        [
            `Package "${missingTemplateId}"`,
            `version "${missingVersion}"`,
            "is not installed."
        ].join(" "),
        "The real Genesis remove-alias output"
    );

    console.log(
        "Real CLI remove alias verified."
    );

    /*
     * Scenario 4:
     * Invalid uninstall arguments should be rejected by
     * PackageCommandDispatcher and reported by genesis.ts.
     */
    const invalidUninstallResult =
        await runGenesis([
            "uninstall",
            "nextjs"
        ]);

    if (
        invalidUninstallResult.exitCode !==
        1
    ) {

        throw new Error(
            [
                "The invalid uninstall command returned the wrong exit code.",
                "Expected: 1",
                `Actual: ${invalidUninstallResult.exitCode}`
            ].join("\n")
        );

    }

    requireIncludes(
        [
            invalidUninstallResult.stdout,
            invalidUninstallResult.stderr
        ].join("\n"),
        "Usage: genesis uninstall <template-id> <version>",
        "The invalid uninstall output"
    );

    if (
        invalidUninstallResult.stdout.includes(
            "Available Template Registries"
        )
    ) {

        throw new Error(
            "The invalid uninstall command entered interactive generation mode."
        );

    }

    console.log(
        "Real CLI argument validation verified."
    );

    /*
     * Scenario 5:
     * An invalid list shape must also be rejected through
     * the real dispatcher.
     */
    const invalidListResult =
        await runGenesis([
            "list",
            "nextjs",
            "unexpected"
        ]);

    if (
        invalidListResult.exitCode !==
        1
    ) {

        throw new Error(
            [
                "The invalid list command returned the wrong exit code.",
                "Expected: 1",
                `Actual: ${invalidListResult.exitCode}`
            ].join("\n")
        );

    }

    requireIncludes(
        [
            invalidListResult.stdout,
            invalidListResult.stderr
        ].join("\n"),
        "Usage: genesis list [template-id]",
        "The invalid list output"
    );

    console.log(
        "Real CLI list validation verified."
    );

    console.log(
        "Genesis package CLI entry-point test completed successfully."
    );

}

main().catch(
    (error: unknown) => {

        console.error(
            "Genesis package CLI entry-point test failed.",
            error
        );

        process.exitCode =
            1;

    }
);