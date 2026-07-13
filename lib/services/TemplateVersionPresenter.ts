import {
    VersionReport
} from "../models";

export class TemplateVersionPresenter {

    public format(
        engineVersion: string,
        report: VersionReport
    ): string {

        const errors =
            report.issues.filter(
                (issue) =>
                    !issue.warning
            );

        const warnings =
            report.issues.filter(
                (issue) =>
                    issue.warning
            );

        const lines:
            string[] = [
                "Version Preview",
                "---------------",
                "",
                `Engine Version : ${engineVersion}`,
                `Status         : ${
                    report.compatible
                        ? "Compatible"
                        : "Incompatible"
                }`
            ];

        if (
            errors.length > 0
        ) {

            lines.push(
                "",
                "Errors",
                "------"
            );

            for (
                const issue
                of errors
            ) {

                lines.push(
                    `- ${issue.message}`
                );

            }

        }

        if (
            warnings.length > 0
        ) {

            lines.push(
                "",
                "Warnings",
                "--------"
            );

            for (
                const issue
                of warnings
            ) {

                lines.push(
                    `- ${issue.message}`
                );

            }

        }

        return lines.join("\n");

    }

}