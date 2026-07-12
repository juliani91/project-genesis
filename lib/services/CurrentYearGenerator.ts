import {
    ComputedVariable
} from "../models";

export class CurrentYearGenerator {

    public generate(
        date: Date = new Date()
    ): ComputedVariable {

        return {
            key: "CURRENT_YEAR",

            value:
                date
                    .getUTCFullYear()
                    .toString()
        };

    }

}