import {
    Wizard,
    WizardAnswer,
    WizardField
} from "../models";

export class WizardSessionValidator {

    public validate(
        wizard: Wizard,
        answers: readonly WizardAnswer[]
    ): string[] {

        const errors: string[] = [];

        const fields =
            wizard.steps.flatMap(
                (step) => step.fields
            );

        this.validateFieldDefinitions(
            fields,
            errors
        );

        this.validateAnswerKeys(
            fields,
            answers,
            errors
        );

        this.validateRequiredAnswers(
            fields,
            answers,
            errors
        );

        this.validateTypedAnswers(
            fields,
            answers,
            errors
        );

        return errors;

    }

    private validateFieldDefinitions(
        fields: readonly WizardField[],
        errors: string[]
    ): void {

        for (const field of fields) {

            if (
                field.type === "select"
            ) {

                if (
                    !field.options ||
                    field.options.length === 0
                ) {

                    errors.push(
                        `Select wizard field has no options: ${field.key}.`
                    );

                    continue;

                }

                const optionValues =
                    field.options.map(
                        (option) => option.value
                    );

                const uniqueValues =
                    new Set(optionValues);

                if (
                    uniqueValues.size !==
                    optionValues.length
                ) {

                    errors.push(
                        `Select wizard field has duplicate option values: ${field.key}.`
                    );

                }

            }

            if (
                field.type !== "string" &&
                field.type !== "multiline" &&
                field.type !== "boolean" &&
                field.type !== "select"
            ) {

                errors.push(
                    `Unsupported wizard field type for ${field.key}: ${String(field.type)}.`
                );

            }

        }

    }

    private validateAnswerKeys(
        fields: readonly WizardField[],
        answers: readonly WizardAnswer[],
        errors: string[]
    ): void {

        const fieldKeys =
            new Set(
                fields.map(
                    (field) => field.key
                )
            );

        const answerCounts =
            new Map<string, number>();

        for (const answer of answers) {

            if (
                !fieldKeys.has(
                    answer.key
                )
            ) {

                errors.push(
                    `Unknown wizard answer key: ${answer.key}.`
                );

            }

            answerCounts.set(
                answer.key,
                (
                    answerCounts.get(
                        answer.key
                    ) ?? 0
                ) + 1
            );

        }

        for (
            const [key, count]
            of answerCounts
        ) {

            if (count > 1) {

                errors.push(
                    `Duplicate wizard answer key: ${key}.`
                );

            }

        }

    }

    private validateRequiredAnswers(
        fields: readonly WizardField[],
        answers: readonly WizardAnswer[],
        errors: string[]
    ): void {

        for (const field of fields) {

            if (!field.required) {
                continue;
            }

            const answer =
                answers.find(
                    (item) =>
                        item.key === field.key
                );

            if (!answer) {

                errors.push(
                    `Required wizard answer is missing: ${field.key}.`
                );

                continue;

            }

            if (
                answer.value.trim().length === 0
            ) {

                errors.push(
                    `Required wizard answer is empty: ${field.key}.`
                );

            }

        }

    }

    private validateTypedAnswers(
        fields: readonly WizardField[],
        answers: readonly WizardAnswer[],
        errors: string[]
    ): void {

        for (const answer of answers) {

            const field =
                fields.find(
                    (item) =>
                        item.key === answer.key
                );

            if (!field) {
                continue;
            }

            if (
                field.type === "boolean" &&
                answer.value !== "true" &&
                answer.value !== "false"
            ) {

                errors.push(
                    `Boolean wizard answer must be "true" or "false": ${field.key}.`
                );

            }

            if (
                field.type === "select"
            ) {

                const validValues =
                    field.options?.map(
                        (option) =>
                            option.value
                    ) ?? [];

                if (
                    !validValues.includes(
                        answer.value
                    )
                ) {

                    errors.push(
                        `Select wizard answer has an invalid value for ${field.key}: ${answer.value}.`
                    );

                }

            }

        }

    }

}