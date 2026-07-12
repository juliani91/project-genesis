import {
    Wizard,
    WizardStep
} from "../models";

export class TemplateWizardInheritanceService {

    public resolve(
        parent: Wizard | undefined,
        child: Wizard | undefined
    ): Wizard | undefined {

        if (!parent) {
            return child;
        }

        if (!child) {
            return parent;
        }

        return {
            title:
                child.title ||
                parent.title,

            description:
                child.description ||
                parent.description,

            steps:
                this.resolveSteps(
                    parent.steps,
                    child.steps
                )
        };

    }

    private resolveSteps(
        parentSteps: readonly WizardStep[],
        childSteps: readonly WizardStep[]
    ): WizardStep[] {

        const resolved =
            new Map<
                string,
                WizardStep
            >();

        for (const step of parentSteps) {

            resolved.set(
                step.id,
                step
            );

        }

        for (const step of childSteps) {

            resolved.set(
                step.id,
                step
            );

        }

        return [
            ...resolved.values()
        ];

    }

}