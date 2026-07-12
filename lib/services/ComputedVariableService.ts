import {
    ComputedVariable,
    VariableCollection
} from "../models";

import {
    CurrentDateGenerator
} from "./CurrentDateGenerator";

import {
    CurrentYearGenerator
} from "./CurrentYearGenerator";

import {
    ProjectSlugGenerator
} from "./ProjectSlugGenerator";

export class ComputedVariableService {

    public apply(
        variables: VariableCollection,
        date: Date = new Date()
    ): readonly ComputedVariable[] {

        const generated:
            ComputedVariable[] = [];

        const projectSlugGenerator =
            new ProjectSlugGenerator();

        const currentDateGenerator =
            new CurrentDateGenerator();

        const currentYearGenerator =
            new CurrentYearGenerator();

        const projectSlug =
            projectSlugGenerator.generate(
                variables
            );

        if (projectSlug) {

            this.addIfMissing(
                variables,
                projectSlug,
                generated
            );

        }

        this.addIfMissing(
            variables,
            currentDateGenerator.generate(
                date
            ),
            generated
        );

        this.addIfMissing(
            variables,
            currentYearGenerator.generate(
                date
            ),
            generated
        );

        return generated;

    }

    private addIfMissing(
        variables: VariableCollection,
        computedVariable: ComputedVariable,
        generated: ComputedVariable[]
    ): void {

        const added =
            variables.setIfMissing(
                computedVariable.key,
                computedVariable.value
            );

        if (added) {

            generated.push(
                computedVariable
            );

        }

    }

}