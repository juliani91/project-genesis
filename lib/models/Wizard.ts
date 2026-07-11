import { WizardOption } from "./WizardOption";

export interface Wizard {
    title: string;

    description: string;

    steps: WizardStep[];
}

export interface WizardStep {
    id: string;

    title: string;

    description: string;

    fields: WizardField[];
}

export interface WizardField {
    /**
     * Variable key produced by this field.
     *
     * Examples:
     * PROJECT_NAME
     * USE_DOCKER
     * DATABASE
     */
    key: string;

    /**
     * User-facing field label.
     */
    label: string;

    /**
     * Controls how the field is presented.
     */
    type: WizardFieldType;

    /**
     * Whether the user must provide a value.
     */
    required: boolean;

    /**
     * Choices available to select fields.
     *
     * This should be present only when:
     *
     * type === "select"
     */
    options?: WizardOption[];
}

export type WizardFieldType =
    | "string"
    | "multiline"
    | "boolean"
    | "select";