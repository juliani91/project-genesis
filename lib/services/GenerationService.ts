import { FileGenerator, FolderGenerator } from "../generators";
import { GenerationPlan } from "../models";

export class GenerationService {

    public async generate(
        plan: GenerationPlan
    ): Promise<void> {

        const folderGenerator =
            new FolderGenerator();

        const fileGenerator =
            new FileGenerator();

        await folderGenerator.generate(
            plan.folders
        );

        await fileGenerator.generate(
            plan.files
        );

    }

}