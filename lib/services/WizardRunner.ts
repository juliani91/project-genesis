import {
    Wizard,
    WizardAnswer,
    WizardField
} from "../models";

import {
    PromptProvider
} from "../prompts";

import { FieldVisibilityEvaluator } from "./FieldVisibilityEvaluator";

export class WizardRunner {

    public async run(
        wizard: Wizard,
        promptProvider: PromptProvider
    ): Promise<WizardAnswer[]> {

        const answers:
            WizardAnswer[] = [];

            const visibilityEvaluator =
    new FieldVisibilityEvaluator();

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

    const visible =
        visibilityEvaluator.isVisible(
            field,
            answers
        );

    if (!visible) {

        console.log(
            `Skipping "${field.label}" because its visibility rule was not satisfied.`
        );

        continue;

    }

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
                await this.collectFieldValue(
                    field,
                    promptProvider
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

    private async collectFieldValue(
        field: WizardField,
        promptProvider: PromptProvider
    ): Promise<string> {

        if (field.type === "boolean") {

            return promptProvider.confirm(
                field.label
            );

        }

        if (field.type === "select") {

            if (
                !field.options ||
                field.options.length === 0
            ) {

                throw new Error(
                    `Select field "${field.key}" does not define any options.`
                );

            }

            return promptProvider.select(
                field.label,
                field.options
            );

        }

        return promptProvider.ask(
            this.buildPromptMessage(
                field
            )
        );

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