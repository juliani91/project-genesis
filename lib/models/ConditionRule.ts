import { GenerationRule } from "./GenerationRule";

export interface ConditionRule
    extends GenerationRule {

    /**
     * Identifies this rule as a variable condition.
     */
    type: "condition";

    /**
     * Variable key to inspect.
     *
     * Example:
     * USE_DOCKER
     * DATABASE
     * AUTHENTICATION
     */
    variable: string;

    /**
     * Expected variable value.
     */
    equals: string;
}