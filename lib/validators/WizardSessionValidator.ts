import {
    Wizard,
    WizardAnswer,
    WizardField
} from "../models";

import {
    FieldVisibilityEvaluator
} from "../services";

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

        this.validateVisibilityRules(
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
                        (option) =>
                            option.value
                    );

                const uniqueValues =
                    new Set(
                        optionValues
                    );

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

    private validateVisibilityRules(
        fields: readonly WizardField[],
        errors: string[]
    ): void {

        const fieldIndexes =
            new Map<string, number>();

        fields.forEach(
            (field, index) => {

                fieldIndexes.set(
                    field.key,
                    index
                );

            }
        );

        for (
            let index = 0;
            index < fields.length;
            index += 1
        ) {

            const field =
                fields[index];

            const rule =
                field.visibleWhen;

            if (!rule) {
                continue;
            }

            if (
                rule.variable.trim()
                    .length === 0
            ) {

                errors.push(
                    `Visibility rule variable is empty for field: ${field.key}.`
                );

            }

            if (
                rule.equals.trim()
                    .length === 0
            ) {

                errors.push(
                    `Visibility rule expected value is empty for field: ${field.key}.`
                );

            }

            const referencedIndex =
                fieldIndexes.get(
                    rule.variable
                );

            if (
                referencedIndex ===
                undefined
            ) {

                errors.push(
                    `Visibility rule for ${field.key} references unknown field: ${rule.variable}.`
                );

                continue;

            }

            if (
                rule.variable ===
                field.key
            ) {

                errors.push(
                    `Visibility rule for ${field.key} cannot reference the same field.`
                );

                continue;

            }

            if (
                referencedIndex > index
            ) {

                errors.push(
                    `Visibility rule for ${field.key} references a later field: ${rule.variable}.`
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
                    (field) =>
                        field.key
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

        const evaluator =
            new FieldVisibilityEvaluator();

        const collectedAnswers:
            WizardAnswer[] = [];

        for (const field of fields) {

            const visible =
                evaluator.isVisible(
                    field,
                    collectedAnswers
                );

            if (!visible) {
                continue;
            }

            const answer =
                answers.find(
                    (item) =>
                        item.key ===
                        field.key
                );

            if (
                field.required &&
                !answer
            ) {

                errors.push(
                    `Required wizard answer is missing: ${field.key}.`
                );

                continue;

            }

            if (
                field.required &&
                answer &&
                answer.value.trim()
                    .length === 0
            ) {

                errors.push(
                    `Required wizard answer is empty: ${field.key}.`
                );

            }

            if (answer) {

                collectedAnswers.push(
                    answer
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
                        item.key ===
                        answer.key
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