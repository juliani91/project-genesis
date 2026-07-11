import {
    ConditionRule,
    GenerationRule,
    VariableCollection
} from "../models";

export class ConditionEvaluator {

    public evaluate(
        rule: GenerationRule,
        variables: VariableCollection
    ): boolean {

        if (rule.type === "condition") {

            const conditionRule =
                rule as ConditionRule;

            return variables.get(
                conditionRule.variable
            ) === conditionRule.equals;

        }

        throw new Error(
            `Unsupported generation rule type: ${String(rule.type)}`
        );

    }

}