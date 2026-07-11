import {
    Wizard,
    WizardAnswer
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

        const fieldKeys =
            new Set(
                fields.map(
                    (field) => field.key
                )
            );

        const answerCounts =
            new Map<string, number>();

        for (const answer of answers) {

            if (!fieldKeys.has(answer.key)) {

                errors.push(
                    `Unknown wizard answer key: ${answer.key}.`
                );

            }

            answerCounts.set(
                answer.key,
                (answerCounts.get(answer.key) ?? 0) + 1
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

            if (answer.value.trim().length === 0) {

                errors.push(
                    `Required wizard answer is empty: ${field.key}.`
                );

            }

        }

        return errors;

    }

}