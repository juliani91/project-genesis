import {
    Wizard,
    WizardAnswer,
    WizardField
} from "../models";

import {
    PromptProvider
} from "../prompts";

export class WizardRunner {

    public async run(
        wizard: Wizard,
        promptProvider: PromptProvider
    ): Promise<WizardAnswer[]> {

        const answers:
            WizardAnswer[] = [];

        console.log("");
        console.log(
            `# ${wizard.title}`
        );

        if (wizard.description) {

            console.log(
                wizard.description
            );

        }

        for (const step of wizard.steps) {

            console.log("");
            console.log(
                `## ${step.title}`
            );

            if (step.description) {

                console.log(
                    step.description
                );

            }

            console.log("");

            for (const field of step.fields) {

                const answer =
                    await this.promptForField(
                        field,
                        promptProvider
                    );

                answers.push(answer);

            }

        }

        return answers;

    }

    private async promptForField(
        field: WizardField,
        promptProvider: PromptProvider
    ): Promise<WizardAnswer> {

        while (true) {

            const value =
                await promptProvider.ask(
                    this.buildPromptMessage(
                        field
                    )
                );

            if (
                field.required &&
                value.length === 0
            ) {

                console.log(
                    `${field.label} is required.`
                );

                continue;

            }

            return {
                key: field.key,
                value
            };

        }

    }

    private buildPromptMessage(
        field: WizardField
    ): string {

        const requiredMarker =
            field.required
                ? " *"
                : "";

        if (field.type === "multiline") {

            return [
                field.label,
                "(enter on one line for now)",
                `${requiredMarker}:`
            ].join(" ");

        }

        return `${field.label}${requiredMarker}:`;

    }

}