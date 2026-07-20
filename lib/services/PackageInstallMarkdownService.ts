import {
    PackageInstallCommand,
    PackageInstallDescriptor,
    VariableCollection
} from "../models";

export class PackageInstallMarkdownService {

    public render(
        descriptor:
            PackageInstallDescriptor,

        variables:
            VariableCollection
    ): string {

        const title =
            variables.resolve(
                descriptor.title
            );

        const lines:
            string[] = [
                `# ${title}`,
                "",
                variables.resolve(
                    descriptor.description
                ),
                "",
                "## System Requirements",
                "",
                ...this.renderList(
                    descriptor.prerequisites,
                    variables
                ),
                "",
                "## Package Manager",
                "",
                descriptor.packageManager
                    ? variables.resolve(
                        descriptor.packageManager
                    )
                    : "Use the package manager documented by the selected template.",
                "",
                "## Install Steps",
                ""
            ];

        for (
            const step
            of descriptor.installSteps
        ) {

            lines.push(
                `### ${variables.resolve(step.title)}`,
                "",
                variables.resolve(
                    step.description
                ),
                "",
                ...this.renderCommands(
                    step.commands,
                    variables
                )
            );

        }

        lines.push(
            "## Environment Variables",
            ""
        );

        if (
            descriptor.environmentVariables.length ===
            0
        ) {

            lines.push(
                "No environment variables are required.",
                ""
            );

        } else {

            for (
                const variable
                of descriptor.environmentVariables
            ) {

                lines.push(
                    [
                        "-",
                        `\`${variable.key}\`:`,
                        variables.resolve(
                            variable.description
                        ),
                        variable.required
                            ? "(required)"
                            : "(optional)",
                        variable.example
                            ? `Example: \`${variables.resolve(variable.example)}\``
                            : ""
                    ]
                        .filter(Boolean)
                        .join(" ")
                );

            }

            lines.push(
                ""
            );

        }

        lines.push(
            "## Verify",
            "",
            ...this.renderCommands(
                descriptor.verifyCommands,
                variables
            ),
            "## Run",
            "",
            ...this.renderCommands(
                descriptor.runCommands,
                variables
            ),
            "## Troubleshooting",
            "",
            ...this.renderList(
                descriptor.notes,
                variables
            )
        );

        return lines.join(
            "\n"
        );

    }

    private renderList(
        values:
            readonly string[],

        variables:
            VariableCollection
    ): string[] {

        if (
            values.length ===
            0
        ) {

            return [
                "- None."
            ];

        }

        return values.map(
            (value) =>
                `- ${variables.resolve(value)}`
        );

    }

    private renderCommands(
        commands:
            readonly PackageInstallCommand[],

        variables:
            VariableCollection
    ): string[] {

        if (
            commands.length ===
            0
        ) {

            return [
                "No commands are required.",
                ""
            ];

        }

        return commands.flatMap(
            (command) => [
                `${variables.resolve(command.label)}${command.platform ? ` (${command.platform})` : ""}:`,
                "",
                "```bash",
                variables.resolve(
                    command.command
                ),
                "```",
                ""
            ]
        );

    }

}
