import {
    GenerationRequest,
    GenerationPlan
} from "../models";

import { GenerationPlanner } from "./GenerationPlanner";
import { GenerationService } from "./GenerationService";
import { PreparationService } from "./PreparationService";

export class ProjectGenerationService {

    public async generate(
        request: GenerationRequest
    ): Promise<GenerationPlan> {

        const preparationService =
            new PreparationService();

        const preparationResult =
            await preparationService.prepare(
                request.template,
                request.answers
            );

        if (
            !preparationResult.success ||
            !preparationResult.template
        ) {

            throw new Error(
                [
                    "Template preparation failed:",
                    ...preparationResult.errors
                ].join(" ")
            );

        }

        const planner =
            new GenerationPlanner();

        const plan =
            await planner.createPlan(
                preparationResult.template,
                request.outputPath
            );

        const generationService =
            new GenerationService();

        await generationService.generate(plan);

        return plan;

    }

}