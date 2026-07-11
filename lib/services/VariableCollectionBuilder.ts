import {
    VariableCollection,
    WizardSession
} from "../models";

export class VariableCollectionBuilder {

    public build(
        session: WizardSession
    ): VariableCollection {

        if (!session.completedAt) {

            throw new Error(
                "Cannot build variables from an incomplete wizard session."
            );

        }

        const variables =
            new VariableCollection();

        for (const answer of session.answers) {

            variables.set(
                answer.key,
                answer.value
            );

        }

        variables.set(
            "CREATED_DATE",
            session.completedAt.toISOString()
        );

        return variables;

    }

}