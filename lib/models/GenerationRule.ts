/**
 * Base contract implemented by all generation rules.
 */
export interface GenerationRule {

    /**
     * Rule type.
     *
     * Examples:
     * condition
     * platform
     * feature
     */
    type: string;

}