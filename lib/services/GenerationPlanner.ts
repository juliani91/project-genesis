import {
    GenerationPlan,
    PreparedTemplate
} from "../models";

export class GenerationPlanner {

    public createPlan(
        preparedTemplate: PreparedTemplate,
        outputPath: string
    ): GenerationPlan {

        // The prepared template will be used when folder and file
        // descriptors are introduced in later steps.
        void preparedTemplate;

        return {
            outputPath,
            folders: [],
            files: [],
            createdAt: new Date()
        };

    }

}