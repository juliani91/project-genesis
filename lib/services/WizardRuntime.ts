import {
    Wizard,
    WizardAnswer,
    WizardSession
} from "../models";

import {
    WizardSessionValidator
} from "../validators";

export class WizardRuntime {

    public execute(
        wizard: Wizard,
        answers: readonly WizardAnswer[]
    ): WizardSession {

        const validator =
            new WizardSessionValidator();

        const errors =
            validator.validate(
                wizard,
                answers
            );

        if (errors.length > 0) {

            throw new Error(
                [
                    "Wizard session validation failed:",
                    ...errors
                ].join(" ")
            );

        }

        const startedAt =
            new Date();

        return {
            wizard,

            answers: [
                ...answers
            ],

            startedAt,

            completedAt:
                new Date()
        };

    }

}