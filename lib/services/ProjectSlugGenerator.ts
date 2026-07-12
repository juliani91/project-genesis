import {
    ComputedVariable,
    VariableCollection
} from "../models";

export class ProjectSlugGenerator {

    public generate(
        variables: VariableCollection
    ): ComputedVariable | undefined {

        const projectName =
            variables.get(
                "PROJECT_NAME"
            );

        if (!projectName) {
            return undefined;
        }

        const value =
            this.createSlug(
                projectName
            );

        if (!value) {
            return undefined;
        }

        return {
            key: "PROJECT_SLUG",
            value
        };

    }

    private createSlug(
        value: string
    ): string {

        return value
            .trim()
            .toLowerCase()
            .replace(
                /[^a-z0-9]+/g,
                "-"
            )
            .replace(
                /-+/g,
                "-"
            )
            .replace(
                /^-|-$/g,
                ""
            );

    }

}