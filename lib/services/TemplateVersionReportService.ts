import {
    TemplateCompositionPlan,
    VersionIssue,
    VersionReport
} from "../models";

import {
    TemplateDeprecationValidator
} from "./TemplateDeprecationValidator";

import {
    TemplateEngineVersionValidator
} from "./TemplateEngineVersionValidator";

import {
    TemplateVersionValidator
} from "./TemplateVersionValidator";

export class TemplateVersionReportService {

    public createReport(
        plan:
            TemplateCompositionPlan,

        engineVersion:
            string
    ): VersionReport {

        const engineValidator =
            new TemplateEngineVersionValidator();

        const templateValidator =
            new TemplateVersionValidator();

        const deprecationValidator =
            new TemplateDeprecationValidator();

        const reports = [
            engineValidator.validate(
                plan,
                engineVersion
            ),

            templateValidator.validate(
                plan
            ),

            deprecationValidator.validate(
                plan
            )
        ];

        const issues:
            VersionIssue[] =
            reports.flatMap(
                (report) =>
                    report.issues
            );

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