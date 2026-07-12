import {
    FieldVisibilityRule,
    WizardAnswer,
    WizardField
} from "../models";

export class FieldVisibilityEvaluator {

    public isVisible(
        field: WizardField,
        answers: readonly WizardAnswer[]
    ): boolean {

        if (!field.visibleWhen) {
            return true;
        }

        return this.evaluateRule(
            field.visibleWhen,
            answers
        );

    }

    private evaluateRule(
        rule: FieldVisibilityRule,
        answers: readonly WizardAnswer[]
    ): boolean {

        const referencedAnswer =
            answers.find(
                (answer) =>
                    answer.key ===
                    rule.variable
            );

        if (!referencedAnswer) {
            return false;
        }

        return (
            referencedAnswer.value ===
            rule.equals
        );

    }

}