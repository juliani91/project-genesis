import {
    TemplateCompositionPlan,
    VersionIssue,
    VersionReport
} from "../models";

import {
    SemanticVersionService
} from "./SemanticVersionService";

export class TemplateEngineVersionValidator {

    public validate(
        plan:
            TemplateCompositionPlan,

        engineVersion:
            string
    ): VersionReport {

        const issues:
            VersionIssue[] = [];

        const versionService =
            new SemanticVersionService();

        /*
         * Validate the engine version itself before
         * checking any templates.
         */
        versionService.parse(
            engineVersion
        );

        for (
            const template
            of plan.orderedTemplates
        ) {

            const manifest =
                template.manifest;

            if (
                manifest.minGenesisVersion
            ) {

                const comparison =
                    versionService.compare(
                        engineVersion,
                        manifest.minGenesisVersion
                    );

                if (
                    comparison < 0
                ) {

                    issues.push({
                        type:
                            "engine-too-old",

                        templateId:
                            manifest.id,

                        warning:
                            false,

                        message:
                            [
                                `Template "${manifest.id}"`,
                                "requires Project Genesis",
                                `${manifest.minGenesisVersion} or newer.`,
                                `Current engine version: ${engineVersion}.`
                            ].join(" ")
                    });

                }

            }

            if (
                manifest.maxGenesisVersion
            ) {

                const comparison =
                    versionService.compare(
                        engineVersion,
                        manifest.maxGenesisVersion
                    );

                if (
                    comparison > 0
                ) {

                    issues.push({
                        type:
                            "engine-too-new",

                        templateId:
                            manifest.id,

                        warning:
                            false,

                        message:
                            [
                                `Template "${manifest.id}"`,
                                "supports Project Genesis up to",
                                `${manifest.maxGenesisVersion}.`,
                                `Current engine version: ${engineVersion}.`
                            ].join(" ")
                    });

                }

            }

        }

        return {
            compatible:
                !issues.some(
                    (issue) =>
                        !issue.warning
                ),

            issues
        };

    }

}