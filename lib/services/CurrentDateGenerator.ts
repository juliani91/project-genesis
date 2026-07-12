import {
    ComputedVariable
} from "../models";

export class CurrentDateGenerator {

    public generate(
        date: Date = new Date()
    ): ComputedVariable {

        return {
            key: "CREATED_DATE",

            value:
                date
                    .toISOString()
                    .slice(0, 10)
        };

    }

}