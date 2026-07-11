import {
    ConditionRule,
    GenerationRule,
    VariableCollection
} from "../lib/models";

import { ConditionEvaluator } from "../lib/services";

function main(): void {

    const variables =
        new VariableCollection();

    variables.set(
        "USE_DOCKER",
        "true"
    );

    variables.set(
        "DATABASE",
        "postgres"
    );

    const evaluator =
        new ConditionEvaluator();

    const matchingRule: ConditionRule = {
        type: "condition",
        variable: "USE_DOCKER",
        equals: "true"
    };

    const failingRule: ConditionRule = {
        type: "condition",
        variable: "DATABASE",
        equals: "sqlite"
    };

    const missingVariableRule: ConditionRule = {
        type: "condition",
        variable: "AUTHENTICATION",
        equals: "true"
    };

    console.log(
        "Matching rule:",
        evaluator.evaluate(
            matchingRule,
            variables
        )
    );

    console.log(
        "Failing rule:",
        evaluator.evaluate(
            failingRule,
            variables
        )
    );

    console.log(
        "Missing variable rule:",
        evaluator.evaluate(
            missingVariableRule,
            variables
        )
    );

    const unsupportedRule = {
        type: "unsupported"
    } as GenerationRule;

    try {

        evaluator.evaluate(
            unsupportedRule,
            variables
        );

        console.error(
            "Unsupported rule test unexpectedly succeeded."
        );

    } catch (error) {

        console.log(
            error instanceof Error
                ? error.message
                : error
        );

    }

}

main();