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
    key: string;
    label: string;
    type: WizardFieldType;
    required: boolean;
}

export type WizardFieldType =
    | "string"
    | "multiline";